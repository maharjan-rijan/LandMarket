// Maths for the profile picture cropper (src/components/account/AvatarCropper.jsx).
//
// The crop frame is a square ("stage"). The photo sits behind it. What the person can change:
//   zoom      1 = the photo just covers the frame, up to MAX_ZOOM
//   rotation  0, 90, 180 or 270 degrees
//   x, y      how far the photo is dragged from the middle, in screen pixels
// Whatever is inside the frame when they press Save is what gets uploaded.

export const MAX_ZOOM = 4;
export const OUTPUT_SIZE = 512;
export const INITIAL_VIEW = { zoom: 1, rotation: 0, x: 0, y: 0 };

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

// width and height of the photo as it appears on screen once it is turned
const turned = (w, h, rotation) => (rotation % 180 === 0 ? { w, h } : { w: h, h: w });

// The scale at which the photo exactly covers the square frame (its shorter side fits).
export function baseScale(w, h, rotation, stage) {
  const t = turned(w, h, rotation);
  return stage / Math.min(t.w, t.h);
}

export const viewScale = (view, natural, stage) => baseScale(natural.w, natural.h, view.rotation, stage) * view.zoom;

// The photo may not be dragged far enough to leave an empty gap inside the frame.
export function clampOffset(offset, w, h, rotation, scale, stage) {
  const t = turned(w, h, rotation);
  const maxX = Math.max(0, (t.w * scale - stage) / 2);
  const maxY = Math.max(0, (t.h * scale - stage) / 2);
  return { x: clamp(offset.x, -maxX, maxX), y: clamp(offset.y, -maxY, maxY) };
}

/*
  One change from the person -> the next view. Always returns a view that fills the frame.
    { type: "zoom", value }   set the zoom         { type: "zoomBy", delta }  step it
    { type: "rotate", by }    turn by 90 or -90    { type: "pan", x, y }      drag to a position
    { type: "nudge", dx, dy } keyboard step        { type: "reset" }
*/
export function nextView(view, action, natural, stage) {
  if (!natural) return view;
  if (action.type === "reset") return { ...INITIAL_VIEW };

  const scaleBefore = viewScale(view, natural, stage);
  const v = { ...view };

  switch (action.type) {
    case "zoom":
      v.zoom = clamp(action.value, 1, MAX_ZOOM);
      break;
    case "zoomBy":
      v.zoom = clamp(view.zoom + action.delta, 1, MAX_ZOOM);
      break;
    case "rotate":
      v.rotation = (((view.rotation + action.by) % 360) + 360) % 360;
      v.x = 0;
      v.y = 0;
      break;
    case "pan":
      v.x = action.x;
      v.y = action.y;
      break;
    case "nudge":
      v.x = view.x + action.dx;
      v.y = view.y + action.dy;
      break;
    default:
      return view;
  }

  // Zooming keeps whatever is in the middle of the frame in the middle.
  if (action.type === "zoom" || action.type === "zoomBy") {
    const ratio = viewScale(v, natural, stage) / scaleBefore;
    v.x = view.x * ratio;
    v.y = view.y * ratio;
  }

  const c = clampOffset({ x: v.x, y: v.y }, natural.w, natural.h, v.rotation, viewScale(v, natural, stage), stage);
  return { ...v, x: c.x, y: c.y };
}

// Where the photo goes on the output canvas, given what the frame showed on screen.
export function outputTransform({ x, y, scale, stage, size = OUTPUT_SIZE }) {
  const k = size / stage;
  return { tx: size / 2 + x * k, ty: size / 2 + y * k, s: scale * k };
}

// Draw what is inside the frame onto a square canvas and return it as a JPEG file. Browser only.
export async function renderCrop(img, view, stage, size = OUTPUT_SIZE) {
  const natural = { w: img.naturalWidth, h: img.naturalHeight };
  const scale = viewScale(view, natural, stage);
  const { tx, ty, s } = outputTransform({ x: view.x, y: view.y, scale, stage, size });

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff"; // transparent PNGs get a white background in the JPEG
  ctx.fillRect(0, 0, size, size);
  ctx.imageSmoothingQuality = "high";
  ctx.translate(tx, ty);
  ctx.rotate((view.rotation * Math.PI) / 180);
  ctx.scale(s, s);
  ctx.drawImage(img, -natural.w / 2, -natural.h / 2);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("Could not prepare the photo. Try a different image.");
  return new File([blob], "avatar.jpg", { type: "image/jpeg" });
}

export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_INPUT_BYTES = 15 * 1024 * 1024;

// A message when the chosen file cannot be used, otherwise "".
export function checkPhotoFile(file) {
  if (!file) return "";
  if (!ALLOWED_TYPES.includes(file.type)) return "Choose a JPG, PNG or WebP photo.";
  if (file.size > MAX_INPUT_BYTES) return "That photo is larger than 15 MB. Choose a smaller one.";
  return "";
}
