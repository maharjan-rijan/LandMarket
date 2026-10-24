import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import api, { getErrors } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getUserId } from "@/lib/user";
import { mapDemand, mapInquiry, mapLand, mapPurchase, mapStore, mapUser } from "@/lib/mappers";
import { composeLands, refreshIsStale, sameData, upsert, without } from "@/lib/dataHelpers";

/*
  Marketplace data, loaded from the Laravel API.

  Pages read plain arrays (lands, vendors, inquiries ...) and call actions such as
  createLand() or setLandStatus(). Every action sends one request, then stores the
  server's answer, so what you see is always what is in MongoDB.
  If a request fails, the error is shown in a toast (see ApiErrorToast) and the
  action returns null.

  The page keeps itself up to date: every few seconds (and when you come back to the tab)
  it quietly asks the API for fresh data, so a new inquiry, listing or reply appears
  without reloading.
*/
const DataContext = createContext(null);

const EMPTY = { lands: [], vendors: [], demands: [], inquiries: [], purchases: [], users: [], saved: [], summary: null, details: {} };
const DATA_KEYS = Object.keys(EMPTY).filter((k) => k !== "details");

// How often the page asks for fresh data while it is open and visible. Guests are polled
// three times less often. Set VITE_POLL_SECONDS=0 in .env to turn it off.
const configured = Number(import.meta.env.VITE_POLL_SECONDS ?? 20);
const POLL_MS = Number.isFinite(configured) ? configured * 1000 : 20000;
const WAKE_GAP_MS = 5000; // coming back to the tab refreshes at once, but not more often than this

// One retry when the connection drops without an answer (not when the server answered with an error).
async function getWithRetry(url) {
  try {
    return await api.get(url);
  } catch (err) {
    if (err.response) throw err;
    await new Promise((resolve) => setTimeout(resolve, 400));
    return api.get(url);
  }
}

function describeFailures(failed) {
  if (!failed.length) return "";
  const list = failed.map((f) => `${f.url} (${f.status ?? "no response"})`).join(", ");
  if (failed.every((f) => f.status == null)) {
    return `The API did not answer at ${api.defaults.baseURL}. Is the Laravel server running? ${list}`;
  }
  if (failed.some((f) => f.status >= 500)) {
    return `Server error on ${list}. The cause is in storage/logs/laravel.log.`;
  }
  return `Could not load ${list}.`;
}

const firstProblem = (err) => {
  const { message, fields } = getErrors(err);
  return Object.values(fields)[0] || message;
};

export function DataProvider({ children }) {
  const { user } = useAuth();
  const uid = getUserId(user);
  const role = user?.role ?? null;

  const [state, setState] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const latest = useRef(0); // numbers the full loads, so an old one can be dropped
  const loads = useRef(0); // loads running right now
  const actionsRunning = useRef(0); // actions (buttons) running right now
  const writeVersion = useRef(0); // goes up whenever an action starts or ends
  const lastRefresh = useRef(0);

  const patch = useCallback((fn) => setState((s) => ({ ...s, ...fn(s) })), []);

  // ---- load everything this role needs ----
  // { silent: true } is the background refresh: no spinner, no error toast, and it changes
  // nothing on screen unless the data really changed.
  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (silent && loads.current > 0) return; // one load at a time
      loads.current += 1;

      // a full load takes over from anything older; a background refresh never does
      const mine = silent ? latest.current : ++latest.current;
      const writeVersionAtStart = writeVersion.current;
      if (!silent) setLoading(true);

      try {
        const jobs = [
          ["lands", "/lands"],
          ["stores", "/stores"],
        ];
        if (role === "buyer") {
          jobs.push(["saved", "/buyer/saved"], ["inquiries", "/buyer/inquiries"], ["demands", "/buyer/demands"], ["purchases", "/buyer/purchases"]);
        }
        if (role === "seller") {
          jobs.push(["myLands", "/seller/lands"], ["inquiries", "/seller/inquiries"], ["demands", "/seller/demands"], ["myStore", "/seller/store"]);
        }
        if (role === "admin") {
          jobs.push(["allLands", "/admin/lands"], ["users", "/admin/users"], ["summary", "/admin/summary"]);
        }

        // One request at a time: PHP's built-in server (php artisan serve) answers one request
        // at a time, and a burst of parallel requests can be dropped. A failed request must
        // not blank the whole app, so each one is handled on its own.
        const data = {};
        const failed = [];
        for (const [key, url] of jobs) {
          try {
            data[key] = (await getWithRetry(url)).data;
          } catch (err) {
            failed.push({ url, status: err.response?.status ?? null });
          }
          if (mine !== latest.current) return; // a newer full load started (for example after a login)
        }

        // A refresh that hit any problem keeps what is on screen. The next one tries again.
        if (silent && failed.length) return;

        // Never let a background answer undo something the person just did.
        if (
          silent &&
          refreshIsStale({
            actionsRunning: actionsRunning.current,
            writeVersionAtStart,
            writeVersionNow: writeVersion.current,
            newerLoadStarted: mine !== latest.current,
          })
        ) {
          setTimeout(() => loadRef.current({ silent: true }), 1500); // always the CURRENT load, never an old role's
          return;
        }

        let lands = (data.lands ?? []).map(mapLand);
        let vendors = (data.stores ?? []).map(mapStore);
        const next = { ...EMPTY };

        if (data.myLands) lands = upsert(lands, data.myLands.map(mapLand));
        if (data.allLands) lands = upsert(lands, data.allLands.map(mapLand));
        if (data.myStore) vendors = upsert(vendors, [mapStore(data.myStore)]);

        if (data.saved) {
          next.saved = data.saved.ids ?? [];
          lands = upsert(lands, (data.saved.lands ?? []).map(mapLand));
        }
        if (data.inquiries) {
          next.inquiries = data.inquiries.map(mapInquiry);
          lands = upsert(lands, data.inquiries.map((i) => i.land).filter(Boolean).map(mapLand));
        }
        if (data.demands) next.demands = data.demands.map(mapDemand);
        if (data.purchases) {
          next.purchases = data.purchases.map((p) => mapPurchase(p, uid));
          lands = upsert(lands, data.purchases.map((p) => p.land).filter(Boolean).map(mapLand));
        }
        if (data.users) next.users = data.users.map(mapUser);
        if (data.summary) next.summary = data.summary;

        next.lands = lands;
        next.vendors = vendors;

        // keep the ownership records already loaded; if nothing changed, change nothing
        setState((prev) => (silent && sameData(prev, next, DATA_KEYS) ? prev : { ...next, details: prev.details }));

        if (!silent) {
          setError(describeFailures(failed));
          setLoading(false);
        }
      } finally {
        loads.current -= 1;
      }
    },
    [role, uid]
  );

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    load();
  }, [load]);

  // ---- keep the page up to date ----
  useEffect(() => {
    const every = uid ? POLL_MS : POLL_MS * 3;
    if (!every) return undefined;

    const refresh = () => {
      lastRefresh.current = Date.now();
      load({ silent: true });
    };
    const onTick = () => {
      if (document.visibilityState === "visible") refresh();
    };
    // coming back to the tab, or back online: catch up straight away
    const onWake = () => {
      if (document.visibilityState === "visible" && Date.now() - lastRefresh.current > WAKE_GAP_MS) refresh();
    };

    lastRefresh.current = Date.now();
    const timer = setInterval(onTick, every);
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);
    window.addEventListener("online", onWake);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
      window.removeEventListener("online", onWake);
    };
  }, [uid, load]);

  // ---- helpers ----
  const run = useCallback(async (fn) => {
    actionsRunning.current += 1;
    writeVersion.current += 1;
    setError("");
    try {
      return await fn();
    } catch (err) {
      setError(firstProblem(err));
      return null;
    } finally {
      actionsRunning.current -= 1;
      writeVersion.current += 1;
    }
  }, []);

  // Put a land (with its ownership record) in the list and keep the record for refreshes.
  const rememberLand = useCallback((land) => {
    setState((s) => ({
      ...s,
      lands: upsert(s.lands, [land]),
      details: { ...s.details, [land.id]: { ...s.details[land.id], ...land } },
    }));
  }, []);

  const fetchLand = useCallback(async (landId) => {
    try {
      const { data } = await api.get(`/lands/${landId}`);
      const land = mapLand(data);
      setState((s) => ({ ...s, details: { ...s.details, [land.id]: { ...s.details[land.id], ...land } } }));
      return land;
    } catch (err) {
      // deleted or hidden: forget what we kept, so a stale copy is not shown
      if (err.response?.status === 404) {
        setState((s) => {
          if (!s.details[landId]) return s;
          const details = { ...s.details };
          delete details[landId];
          return { ...s, details };
        });
      }
      return null;
    }
  }, []);

  const lands = useMemo(() => composeLands(state.lands, state.details), [state.lands, state.details]);

  const myStore = useMemo(() => state.vendors.find((v) => v.ownerId === uid) ?? null, [state.vendors, uid]);
  const getLand = useCallback((id) => lands.find((l) => l.id === id) ?? state.details[id] ?? null, [lands, state.details]);
  const getVendor = useCallback((id) => state.vendors.find((v) => v.id === id) ?? null, [state.vendors]);

  // ---- seller ----
  const createLand = useCallback(
    (v) =>
      run(async () => {
        const { data } = await api.post("/seller/lands", {
          title: v.title,
          district: v.district,
          municipality: v.municipality,
          ward: v.ward,
          area_aana: v.areaAana,
          price_per_aana: v.pricePerAana,
          road_ft: v.roadFt,
          facing: v.facing,
          description: v.description,
          documents: v.documents,
        });
        const land = mapLand(data);
        rememberLand(land);
        return land;
      }),
    [run, rememberLand]
  );

  const setLandStatus = useCallback(
    (id, status, extra = {}) =>
      run(async () => {
        const { data } = await api.patch(`/seller/lands/${id}/status`, {
          status,
          buyer_name: extra.buyerName || undefined,
          buyer_email: extra.buyerEmail || undefined,
        });
        const land = mapLand(data);
        rememberLand(land);
        return land;
      }),
    [run, rememberLand]
  );

  // Sellers delete their own listings, admins delete any
  const removeLand = useCallback(
    (id) =>
      run(async () => {
        await api.delete(`${role === "admin" ? "/admin/lands" : "/seller/lands"}/${id}`);
        patch((s) => {
          const details = { ...s.details };
          delete details[id];
          return { lands: without(s.lands, id), details };
        });
        return true;
      }),
    [run, patch, role]
  );

  const saveStore = useCallback(
    (values) =>
      run(async () => {
        const { data } = await api.put("/seller/store", values);
        const store = mapStore(data);
        patch((s) => ({ vendors: upsert(s.vendors, [store]) }));
        return store;
      }),
    [run, patch]
  );

  const setInquiryStatus = useCallback(
    (id, status) =>
      run(async () => {
        const { data } = await api.patch(`/seller/inquiries/${id}`, { status });
        const inquiry = mapInquiry(data);
        patch((s) => ({ inquiries: upsert(s.inquiries, [inquiry]) }));
        return inquiry;
      }),
    [run, patch]
  );

  const replyToInquiry = useCallback(
    (id, message) =>
      run(async () => {
        const { data } = await api.post(`/seller/inquiries/${id}/replies`, { message });
        const inquiry = mapInquiry(data);
        patch((s) => ({ inquiries: upsert(s.inquiries, [inquiry]) }));
        return inquiry;
      }),
    [run, patch]
  );

  // ---- buyer ----
  const toggleSaved = useCallback(
    async (id) => {
      const was = state.saved.includes(id);
      // show the change straight away, undo it if the server refuses
      patch((s) => ({ saved: was ? s.saved.filter((x) => x !== id) : [...s.saved, id] }));
      const ok = await run(async () => {
        if (was) await api.delete(`/buyer/saved/${id}`);
        else await api.post(`/buyer/saved/${id}`);
        return true;
      });
      if (!ok) patch((s) => ({ saved: was ? [...s.saved, id] : s.saved.filter((x) => x !== id) }));
    },
    [state.saved, run, patch]
  );

  const sendInquiry = useCallback(
    ({ land, message, phone }) =>
      run(async () => {
        const { data } = await api.post(`/lands/${land.id}/inquiries`, { message, phone: phone || undefined });
        const inquiry = mapInquiry(data);
        patch((s) => ({ inquiries: [inquiry, ...s.inquiries] }));
        return inquiry;
      }),
    [run, patch]
  );

  const addDemand = useCallback(
    (v) =>
      run(async () => {
        const { data } = await api.post("/buyer/demands", {
          district: v.district,
          min_aana: v.minAana,
          max_price_per_aana: v.maxPricePerAana,
          phone: v.phone || undefined,
          note: v.note || undefined,
        });
        const demand = mapDemand(data);
        patch((s) => ({ demands: [demand, ...s.demands] }));
        return demand;
      }),
    [run, patch]
  );

  const setDemandStatus = useCallback(
    (id, status) =>
      run(async () => {
        const { data } = await api.patch(`/buyer/demands/${id}`, { status });
        const demand = mapDemand(data);
        patch((s) => ({ demands: upsert(s.demands, [demand]) }));
        return demand;
      }),
    [run, patch]
  );

  // Sell a bought land on: the new owner is added to its ownership record.
  const resellLand = useCallback(
    (landId, { buyerName, buyerEmail }) =>
      run(async () => {
        const { data } = await api.post(`/buyer/purchases/${landId}/resell`, {
          buyer_name: buyerName,
          buyer_email: buyerEmail || undefined,
        });
        const purchase = mapPurchase(data, uid);
        const land = mapLand(data.land);
        patch((s) => ({ purchases: upsert(s.purchases, [purchase]) }));
        rememberLand(land);
        return purchase;
      }),
    [run, patch, rememberLand, uid]
  );

  // ---- admin ----
  const setUserStatus = useCallback(
    (id, status) =>
      run(async () => {
        const { data } = await api.patch(`/admin/users/${id}/status`, { status });
        const u = mapUser(data);
        patch((s) => ({ users: upsert(s.users, [u]) }));
        return u;
      }),
    [run, patch]
  );

  const value = useMemo(
    () => ({
      uid,
      loading,
      error,
      clearError: () => setError(""),
      reload: () => load(),
      lands,
      vendors: state.vendors,
      demands: state.demands,
      users: state.users,
      inquiries: state.inquiries,
      purchases: state.purchases,
      summary: state.summary,
      myStore,
      savedIds: state.saved,
      getLand,
      getVendor,
      fetchLand,
      createLand,
      setLandStatus,
      removeLand,
      saveStore,
      setInquiryStatus,
      replyToInquiry,
      toggleSaved,
      sendInquiry,
      addDemand,
      setDemandStatus,
      resellLand,
      setUserStatus,
      // the old browser-only sample data no longer exists
      hasSample: false,
      clearSample: () => {},
    }),
    [state, lands, uid, loading, error, load, myStore, getLand, getVendor, fetchLand, createLand, setLandStatus, removeLand, saveStore, setInquiryStatus, replyToInquiry, toggleSaved, sendInquiry, addDemand, setDemandStatus, resellLand, setUserStatus]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
};
