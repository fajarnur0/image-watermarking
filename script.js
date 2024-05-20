// START OF TABS
document.addEventListener("DOMContentLoaded", function () {
  let tabs = document.querySelectorAll(".tab");
  let indicator = document.querySelector(".indicator");
  let panels = document.querySelectorAll(".tab-panel");

  function updateIndicator(tab) {
    indicator.style.width = tab.getBoundingClientRect().width + "px";
    indicator.style.left =
      tab.getBoundingClientRect().left -
      tab.parentElement.getBoundingClientRect().left +
      "px";
  }

  updateIndicator(tabs[0]);

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      let tabTarget = tab.getAttribute("aria-controls");

      tabs.forEach((t) => {
        t.setAttribute("aria-selected", "false");
        t.setAttribute("tabindex", "-1");
      });

      tab.setAttribute("aria-selected", "true");
      tab.setAttribute("tabindex", "0");

      updateIndicator(tab);

      panels.forEach((panel) => {
        let panelId = panel.getAttribute("id");
        if (tabTarget === panelId) {
          panel.classList.remove("invisible", "opacity-0");
          panel.classList.add("visible", "opacity-100");
        } else {
          panel.classList.add("invisible", "opacity-0");
        }
      });
    });
  });
});
// END OF TABS

// START OF IMAGE INPUT DISPLAY
document.addEventListener("DOMContentLoaded", () => {
  let displayImagePreview = (inputElement, previewContainerId) => {
    let file = inputElement.files[0];
    if (file) {
      let reader = new FileReader();
      reader.onload = (e) => {
        const previewContainer = document.getElementById(previewContainerId);
        previewContainer.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-contain rounded-md" />`;
      };
      reader.readAsDataURL(file);
    }
  };

  const originalImageInput = document.getElementById("inputImage");
  originalImageInput.addEventListener("change", () => {
    displayImagePreview(originalImageInput, "inputImageDisplay");
  });

  const watermarkImageInput = document.getElementById("inputWatermark");
  watermarkImageInput.addEventListener("change", () => {
    displayImagePreview(watermarkImageInput, "wmImageDisplay");
  });

  const watermarkedImage = document.getElementById("watermarkedImage");
  watermarkedImage.addEventListener("change", () => {
    displayImagePreview(watermarkedImage, "watermarkedDisplay");
  });
});
// END OF IMAGE INPUT DISPLAY

// START OF EMBED WATERMARK FUNCTION
function embedWatermark() {
  const inputImage = document.getElementById("inputImage").files[0];
  const inputWatermark = document.getElementById("inputWatermark").files[0];
  var output = document.getElementById("outputImage");

  console.log(inputImage);
  if (!inputImage || !inputWatermark) {
    alert("Please select both original image and watermark image.");
    return;
  }

  // Create element <canvas>
  var canvas = document.createElement('canvas');
  const ctx = canvas.getContext("2d");

  const img = new Image();
  const watermark = new Image();

  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    watermark.onload = function () {
      const watermarkCanvas = document.createElement("canvas");
      watermarkCanvas.width = img.width;
      watermarkCanvas.height = img.height;
      const watermarkCtx = watermarkCanvas.getContext("2d");
      watermarkCtx.drawImage(watermark, 0, 0, img.width, img.height);

      const watermarkData = watermarkCtx.getImageData(
        0,
        0,
        img.width,
        img.height
      );
      const imageData = ctx.getImageData(0, 0, img.width, img.height);

      // Embed watermark
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (watermarkData.data[i] < 128) {
          // LSB manipulation
          imageData.data[i] &= 0xfe; // Clear LSB
        } else {
          imageData.data[i] |= 1; // Set LSB
        }
      }

      ctx.putImageData(imageData, 0, 0);

      output.src = canvas.toDataURL();
      document.getElementById("downloadButton").style.display = "block";
      // const downloadLink = document.getElementById("downloadLink");
      // downloadLink.href = canvas.toDataURL();
      // downloadLink.download = "watermarked_image.png";
      // downloadLink.style.display = "block";
    };

    watermark.src = URL.createObjectURL(inputWatermark);
  };

  img.src = URL.createObjectURL(inputImage);
}
// END OF EMBED WATERMARK FUNCTION

// fungsi untuk mendownload image stegano
function downloadImage() {
  var output = document.getElementById("outputImage");
  var link = document.createElement("a");
  link.href = output.src;
  link.download = "watermarked_image.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// START OF EXTRACT WATERMARK FUNCTION
function extractWatermark() {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  let img = new Image();

  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    let imageData = ctx.getImageData(0, 0, img.width, img.height);
    let watermarkData = new Uint8Array(img.width * img.height);

    // Extract watermark
    for (let i = 0; i < imageData.data.length; i += 4) {
      let lsb = imageData.data[i] & 1; // Extract LSB
      watermarkData[i / 4] = lsb * 255;
    }

    // Convert watermark data to image
    let watermarkCanvas = document.createElement("canvas");
    watermarkCanvas.width = img.width;
    watermarkCanvas.height = img.height;
    let watermarkCtx = watermarkCanvas.getContext("2d");
    let extractedWatermark = watermarkCtx.createImageData(
      img.width,
      img.height
    );

    for (let i = 0; i < watermarkData.length; i++) {
      extractedWatermark.data[i * 4] = watermarkData[i];
      extractedWatermark.data[i * 4 + 1] = watermarkData[i];
      extractedWatermark.data[i * 4 + 2] = watermarkData[i];
      extractedWatermark.data[i * 4 + 3] = 255; // Alpha channel
    }

    watermarkCtx.putImageData(extractedWatermark, 0, 0);

    let downloadLink = document.getElementById("extractDownloadLink");
    let extractOutputImage = document.getElementById("extractOutputImage");
    extractOutputImage.src = watermarkCanvas.toDataURL();
    downloadLink.href = extractOutputImage.src;
  };

  let inputImage = document.getElementById("watermarkedImage").files[0];
  img.src = URL.createObjectURL(inputImage);
}

function downloadExtractImg() {
  var output = document.getElementById("extractOutputImage");
  var link = document.createElement("a");
  link.href = output.src;
  link.download = "extracted_watermark.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}