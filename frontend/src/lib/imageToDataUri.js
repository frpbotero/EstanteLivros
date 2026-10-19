const MAX_SIDE = 300;
const QUALITY = 0.75;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Arquivo não é uma imagem válida"));
    };
    image.src = url;
  });
}

// Reduz a imagem para no máximo 300px e devolve um data URI JPEG (~20-40KB).
export async function imageToDataUri(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem");
  }
  const image = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const context = canvas.getContext("2d");
  context.fillStyle = "#fff"; // PNG transparente vira fundo branco no JPEG
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", QUALITY);
}
