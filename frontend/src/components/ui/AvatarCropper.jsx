import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { HiOutlineRefresh, HiOutlineZoomIn, HiOutlineZoomOut } from "react-icons/hi";
import { INITIAL_VIEW, MAX_ZOOM, nextView, renderCrop, viewScale } from "@/lib/crop";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const PREVIEW = 56;


export default function AvatarCropper({ src, saving, error, onCancel, onSave }) {
  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const drag = useRef(null);

  const [natural, setNatural] = useState(null); // { w, h } once the photo has loaded
  const [unreadable, setUnreadable] = useState(false);
  const [stage, setStage] = useState(288); // side of the square frame, in pixels
  const [view, setView] = useState(INITIAL_VIEW);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  // the newest sizes, for handlers that are not recreated on every render (like the wheel)
  const latest = useRef({ natural: null, stage: 288 });
  latest.current = { natural, stage };

  const change = useCallback((action) => {
    setView((v) => nextView(v, action, latest.current.natural, latest.current.stage));
  }, []);

  // measure the frame, and again whenever it changes size (a phone turned sideways)
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const measure = () => {
      if (el.clientWidth > 0) setStage(el.clientWidth);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // after the frame or the photo changes size, make sure the photo still fills the frame
  useEffect(() => {
    change({ type: "nudge", dx: 0, dy: 0 });
  }, [stage, natural, change]);

  // mouse wheel zooms. It needs a native listener, because React's wheel handler cannot stop the page scrolling.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      change({ type: "zoomBy", delta: e.deltaY < 0 ? 0.12 : -0.12 });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [change]);

  // ---- moving the photo ----
  const onPointerDown = (e) => {
    if (!natural || e.button > 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: view.x, y: view.y };
    setDragging(true);
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (d) change({ type: "pan", x: d.x + (e.clientX - d.px), y: d.y + (e.clientY - d.py) });
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  const onKeyDown = (e) => {
    const step = e.shiftKey ? 24 : 8;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      change({ type: "nudge", dx: moves[e.key][0], dy: moves[e.key][1] });
    } else if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      change({ type: "zoomBy", delta: 0.1 });
    } else if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      change({ type: "zoomBy", delta: -0.1 });
    }
  };

  const save = async () => {
    setLocalError("");
    setBusy(true);
    try {
      const file = await renderCrop(imgRef.current, view, stage);
      await onSave(file);
    } catch (err) {
      setLocalError(err.message || "Could not prepare the photo.");
    } finally {
      setBusy(false);
    }
  };

  const scale = natural ? viewScale(view, natural, stage) : 1;
  const ready = Boolean(natural);
  const percent = Math.round(view.zoom * 100);

  // the photo, positioned inside a frame of any size (factor 1 = the real frame)
  const photoStyle = (factor) => ({
    position: "absolute",
    left: "50%",
    top: "50%",
    width: natural?.w,
    height: natural?.h,
    maxWidth: "none",
    userSelect: "none",
    pointerEvents: "none",
    transformOrigin: "center",
    visibility: ready ? "visible" : "hidden",
    transform: `translate(-50%, -50%) translate(${view.x * factor}px, ${view.y * factor}px) rotate(${view.rotation}deg) scale(${scale * factor})`,
  });

  const gridLine = (style) => (
    <span aria-hidden="true" style={{ position: "absolute", background: "rgba(255,255,255,.45)", pointerEvents: "none", ...style }} />
  );

  const message = unreadable ? "That image could not be read. Choose a JPG, PNG or WebP photo." : localError || error;

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={stageRef}
        tabIndex={0}
        role="group"
        aria-label="Photo crop area. Drag to move the photo. Arrow keys nudge it. Plus and minus zoom."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        style={{
          position: "relative",
          width: "min(100%, 20rem)",
          aspectRatio: "1 / 1",
          margin: "0 auto",
          overflow: "hidden",
          borderRadius: "var(--r-md)",
          background: "#24332c",
          touchAction: "none",
          cursor: !ready ? "default" : dragging ? "grabbing" : "grab",
        }}
      >
        <img
          ref={imgRef}
          src={src}
          alt=""
          draggable={false}
          decoding="async"
          onLoad={(e) => {
            const w = e.currentTarget.naturalWidth;
            const h = e.currentTarget.naturalHeight;
            if (w && h) setNatural({ w, h });
            else setUnreadable(true);
          }}
          onError={() => setUnreadable(true)}
          style={photoStyle(1)}
        />

        {gridLine({ left: "33.333%", top: 0, bottom: 0, width: 1 })}
        {gridLine({ left: "66.666%", top: 0, bottom: 0, width: 1 })}
        {gridLine({ top: "33.333%", left: 0, right: 0, height: 1 })}
        {gridLine({ top: "66.666%", left: 0, right: 0, height: 1 })}
        <span aria-hidden="true" style={{ position: "absolute", inset: 0, border: "2px solid rgba(255,255,255,.9)", borderRadius: "var(--r-md)", pointerEvents: "none" }} />

        {!ready && !unreadable && (
          <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#d6e2db", fontSize: ".9rem" }}>Loading photo...</span>
        )}
      </div>

      <p className="hint" style={{ textAlign: "center", marginTop: 0 }}>
        Drag the photo to move it. Zoom with the slider or the mouse wheel.
      </p>

      <div className="flex items-center gap-3">
        <Button variant="icon" aria-label="Zoom out" disabled={!ready || view.zoom <= 1} style={{ opacity: !ready || view.zoom <= 1 ? 0.4 : 1 }} onClick={() => change({ type: "zoomBy", delta: -0.2 })}>
          <HiOutlineZoomOut size={20} />
        </Button>
        <Input
          type="range"
          name="avatar-zoom"
          aria-label="Zoom"
          className="flex-1"
          aria-valuetext={`${percent} percent`}
          min="1"
          max={MAX_ZOOM}
          step="0.01"
          value={view.zoom}
          disabled={!ready}
          onChange={(e) => change({ type: "zoom", value: Number(e.target.value) })}
          style={{ accentColor: "var(--terrace)" }}
        />
        <Button variant="icon" aria-label="Zoom in" disabled={!ready || view.zoom >= MAX_ZOOM} style={{ opacity: !ready || view.zoom >= MAX_ZOOM ? 0.4 : 1 }} onClick={() => change({ type: "zoomBy", delta: 0.2 })}>
          <HiOutlineZoomIn size={20} />
        </Button>
        <span className="text-sm text-muted num" style={{ minWidth: "3.2rem", textAlign: "right" }}>{percent}%</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" disabled={!ready} onClick={() => change({ type: "rotate", by: -90 })}>
          <HiOutlineRefresh size={16} style={{ transform: "scaleX(-1)" }} aria-hidden="true" /> Rotate left
        </Button>
        <Button size="sm" variant="outline" disabled={!ready} onClick={() => change({ type: "rotate", by: 90 })}>
          <HiOutlineRefresh size={16} aria-hidden="true" /> Rotate right
        </Button>
        <Button size="sm" variant="ghost" disabled={!ready} onClick={() => change({ type: "reset" })}>
          Reset
        </Button>

        <div className="flex items-center gap-2" style={{ marginLeft: "auto" }}>
          <div
            aria-hidden="true"
            style={{ position: "relative", width: PREVIEW, height: PREVIEW, overflow: "hidden", borderRadius: "var(--r-md)", background: "var(--terrace-wash)", border: "1px solid var(--line-strong)" }}
          >
            <img src={src} alt="" draggable={false} style={photoStyle(PREVIEW / stage)} />
          </div>
          <span className="text-xs text-muted">How it will look</span>
        </div>
      </div>

      <Alert>{message}</Alert>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={save} loading={busy || saving} disabled={!ready}>Save photo</Button>
      </div>
    </div>
  );
}
