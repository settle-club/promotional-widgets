class SettlePopupWidget extends HTMLElement {
  defaultTheme = "rgb(1, 89, 79)";
  attributes = {
    selector: "",
    currency: "₹",
    emiTenure: [3],
    totalOrderValue: "3000",
    productName: "Your Product Name	",
    showProductName: true,
    theme: this.defaultTheme,
    logoPosition: "right",
    buttonText: "Interest free monthly payments with",
    showModalPreview: false,
  };

  static get observedAttributes() {
    return [
      "currency",
      "emiTenure",
      "totalOrderValue",
      "productName",
      "showProductName",
      "theme",
      "logoPosition",
      "buttonText",
      "showModalPreview",
    ];
  }

  constructor(props = {}) {
    super();
    this.attributes = {
      ...this.attributes,
      ...props,
    };

    this.attachShadow({ mode: "open" });
    this.renderAndBindListners();
  }

  connectedCallback() {
    this.renderAndBindListners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.attributes[name] = newValue;
      this.renderAndBindListners();
    }
  }

  async renderAndBindListners() {
    await this.render();
    this.setupEventListeners();
  }

  adjustBrightness(rgb, opacityPercentage) {
    // Parse the RGB color code
    const regex = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
    let rgbCodeParts = regex.exec(rgb);

    if (!rgbCodeParts) {
      console.error("Invalid RGB color format");
      rgb = this.defaultTheme; // Default theme color
      rgbCodeParts = regex.exec(rgb);
    }

    const r = parseInt(rgbCodeParts[1]);
    const g = parseInt(rgbCodeParts[2]);
    const b = parseInt(rgbCodeParts[3]);

    const alpha = Math.min(1, Math.max(0, opacityPercentage / 100));
    const rgbaColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;

    return rgbaColor;
  }

  loadAndModifySVG = async (color) => {
    const logoUrl =
      "https://cdn.pixelbin.io/v2/potlee/original/public/logos/settle-new/settleBranding.svg";

    try {
      const response = await fetch(logoUrl);
      const svgText = await response.text();

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
      const svgElement = svgDoc.querySelector("svg");

      svgElement.querySelectorAll("path")?.forEach((element) => {
        element.setAttribute("fill", color);
        element.style.fill = color;
      });

      const modifiedSVG = new XMLSerializer().serializeToString(svgElement);

      const svgBlob = new Blob([modifiedSVG], { type: "image/svg+xml" });
      const urlObject = URL.createObjectURL(svgBlob);

      return urlObject;
    } catch (error) {
      console.error("Error loading or modifying SVG:", error);
      return logoUrl;
    }
  };

  async render() {
    const buttonText =
      this.getAttribute("buttonText") ||
      this.attributes.buttonText ||
      "Interest free monthly payments with";
    const currency =
      this.getAttribute("currency") || this.attributes.currency || "₹";
    const logoPosition =
      this.getAttribute("logoPosition") ||
      this.attributes.logoPosition ||
      "right";

    const totalOrderValue =
      this.getAttribute("totalOrderValue") ||
      this.attributes.totalOrderValue ||
      "3000";

    const productName =
      this.getAttribute("productName") || this.attributes.productName || "Your Product Name";
    const showProductName = eval(
      this.getAttribute("showProductName") ||
        this.hasAttribute("showProductName") ||
        this.attributes.showProductName ||
        false
    );
    const showModalPreview = eval(
      this.getAttribute("showModalPreview") ||
        this.hasAttribute("showModalPreview") ||
        this.attributes.showModalPreview ||
        false
    );

    const themeRGBColor =
      this.getAttribute("theme") || this.attributes.theme || this.defaultTheme;
    const lighterThemeColor = this.adjustBrightness(themeRGBColor, 10);

    const formatDate = (monthsAhead) => {
      const today = new Date();
      const futureDate = new Date(
        today.setMonth(today.getMonth() + monthsAhead)
      );
      return futureDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    const month1 = formatDate(1);
    const month2 = formatDate(2);
    const month3 = formatDate(3);

    const emiValue = Math.round(totalOrderValue / 3).toLocaleString("en-IN");

    const screenWidth = window.innerWidth;
    const scale =
      screenWidth <= 360 || totalOrderValue.length >= 5
        ? "scale(0.8)"
        : "scale(1)";

    const logo = await this.loadAndModifySVG(themeRGBColor);
    const logoSVG = (width = "92") => {
      return `
            <img 
              src='${logo}' 
              alt="settle logo"             
              class="svg-logo" 
              style="width:${width}px">
            </img>
        `;
    };

    const css = `
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link
            href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
            rel="stylesheet">
            <style>
        .settleFont {
            font-family: Poppins !important;
            margin: 0;
        }

        .card {
            max-width: fit-content;
            padding: 10px;
            cursor: pointer;
            border-radius: 15px;
            border: 2px solid ${themeRGBColor};
            background-color: white;
            margin-bottom: 8px;
        }

        .header {
            font-size: 14px;
            display: flex;
            align-items: center;
            font-weight: 400;
        }

        .headerContent {
            margin: 3px 0;
            gap: 4px;
        }

        .settleLogo {
            height: 15px;
            margin-bottom: -3px;
            color: ${themeRGBColor};
        }

        .svg-logo-container {
          color: ${themeRGBColor};
          display: inline-flex;
        }

        .content {
            font-size: 16px;
            color: rgb(106, 157, 106);
            font-weight: 500;
            z-index: 2147483647;
            /* margin-bottom: 20px; */
        }

        .modal {
            display: none;
            position: fixed;
            z-index: 2147483647;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
        }

        .modal-center {
            width: 100%;
            height: 100%;
            overflow: auto;
            display: flex;        
            justify-content: center;
            align-items: center;
            background-color: rgba(136, 136, 136, 0.243);
        }

        .preview-modal-container {
            display: flex;
        }

        .modal-content {
            height: fit-content;
            background-color: white;
            padding: 22px 20px;
            min-width: 320px;
            border: 2px solid ${themeRGBColor};
            border-radius: 30px;
            display: grid;
            gap: 14px;
            box-sizing: content-box;
            position: relative;
            transform: ${scale};
            z-index: 2147483647;
            margin: 0 auto;
        }

        .preview-modal-content {
            margin-top: 14px;
            // z-index: 2147483640; 
            z-index: 1; 
        }

        .modal-content .settleLogo {            
            height: 24px;
        }

        .productName {
            width: fit-content;
            background-color: #F5F5F5;
            font-size: 12px;
            font-weight: normal;
            padding: 9px 8px;
            border-radius: 12px;
        }

        .orderDetails {
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }

        .orderDetails .title {
            font-size: 26px;
            font-weight: 600;
            line-height: 130%;
            transform:${scale};
        }

        .orderDetails .title .emiValue {
            color: ${themeRGBColor}
        }

        .totalOrder {
            border: 1px solid ${themeRGBColor};
            border-radius: 14px;
            padding: 6px 14px;
            display: grid;
            justify-content: center;
            height: max-content;
            transform:${scale};
        }

        .totalOrder .value {
            color: #3F3F3F;
            font-size: 26px;
            font-weight: 600;
            line-height: 130%;
        }

        .totalOrder .subtitle {
            color: #575757;
            font-size: 14px;
            font-weight: normal;
            text-align: center;
        }

        .emis {
            margin-top: 6px;
            padding: 6px 10px;
            display: flex;
            justify-content: space-around;
            gap: 6px;
            flex-wrap: wrap;
        }

        .emiOption {
            display: grid;
            gap: 10px;
            justify-items: center;
        }

        .pie1 {
            width: 65px;
            height: 65px;
            background-image: conic-gradient(${themeRGBColor} 33%, white 33%);
            border-radius: 50%;
            border: 1px solid #D1D1D1;
        }

        .pie2 {
            width: 65px;
            height: 65px;
            background-image: conic-gradient(${themeRGBColor} 66%, white 66%);
            border-radius: 50%;
            border: 1px solid #D1D1D1;
        }

        .pie3 {
            width: 65px;
            height: 65px;
            background-image: conic-gradient(${themeRGBColor} 100%, white 0%);
            border-radius: 50%;
            border: 1px solid #D1D1D1;
        }

        .emiOption .emiValue {
            font-size: 12px;
            text-align: center;
        }

        .features {
            padding: 6px 14px;
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            font-weight: 300;
            color: #5a5a5a;
            // flex-wrap: wrap;
        }

        .features .text {
            max-width: 80px;
            text-align: center;
        }

        .steps .title {
            font-size: 18px;
            font-weight: 500;
            margin-top: 12px;
        }

        .steps .list {
            display: grid;
            gap: 14px;
            font-size: 14px;
            font-weight: 400;
            color: #505050;
            margin: 16px 0;
        }

        .steps .listItem {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .steps .listItem img {
            width: 28px;
        }

        .select {
            width: -webkit-fill-available;
            padding: 20px;
            font-size: 14px;
            text-align: center;
            border-radius: 20px;
            background-color: ${lighterThemeColor};
        }

        .select img {
          margin-bottom: -1px;
        }

        .close {
            color: rgba(0, 0, 0, 0.537);
            float: right;
            font-size: 24px;
            font-weight: 200;
            background-color: #e1e1e1;
            width: fit-content;
            height: 19px;
            display: flex;
            align-items: center;
            padding: 4px 6px;
            border-radius: 50%;
            position: absolute;
            right: 15px;
            top: 17px;
            cursor: pointer;
        }

        .declaration-text {
            font-size: 0.7em; 
            color: rgb(217, 214, 214); 
            font-style: italic;
            min-width: fit-content;
            width: min-content;
        }

        /* Media Query for Mobile Devices */
        @media (max-width: 365px) {
            .modal-content {
                min-width: 250px;
                margin-top: 150px;
            }

            .preview-modal-content {
                margin-top: 14px;
            }
        }

        @media (max-width: 300px) {
            .modal-content {
                min-width: auto;
            }
        }

        @media (max-width: 320px), (max-height: 700px) {
            .modal-content {
                margin-top: 80px;
            }
                
            .preview-modal-content {
                margin-top: 14px;
            }
        }

        
        @media (max-width: 240px), (max-height: 530px) {
            .modal-content {
                margin-top: 300px;
            }
            
            .preview-modal-content {
                margin-top: 14px;
            }
        }


    </style>
        `;

    const modalContent = `
        <div class="modal-content ${
          showModalPreview ? "preview-modal-content" : ""
        }">
            ${logoSVG()}
            <div class="close">&times;</div>
            ${
              showProductName && productName
                ? `
                <div class="productName">
                    ${productName}
                </div>
                `
                : ``
            }
            <div class="orderDetails">
                <div class="title">
                    Start as <br />
                    Low as <span class="emiValue">${currency}${emiValue}</span>
                </div>
                <div class="totalOrder">
                    <div class="value">${currency}${totalOrderValue}</div>
                    <div class="subtitle">Order total</div>
                </div>
            </div>
            <div class="emis">
                <div class="emiOption">
                    <div class="pie1"></div>
                    <div class="emiValue">pay ${currency}${emiValue}*<br />${month1}</div>
                </div>
                <div class="emiOption">
                    <div class="pie2"></div>
                    <div class="emiValue">pay ${currency}${emiValue}*<br />${month2}</div>
                </div>
                <div class="emiOption">
                    <div class="pie3"></div>
                    <div class="emiValue">pay ${currency}${emiValue}*<br />${month3}</div>
                </div>
            </div>
            <div class="features">
                <div class="text">Instant Credit</div>
                <div class="text">Flexible Repayments</div>
                <div class="text">Priority Support</div>
            </div>
            <div class="steps">
                <div class="title">Steps to perform: </div>
                <div class="list">
                    <div class="listItem"><img src="https://cdn.pixelbin.io/v2/potlee/original/tick.png" />Add
                        products to cart</div>
                    <div class="listItem"><img src="https://cdn.pixelbin.io/v2/potlee/original/tick.png" />Checkout
                        with Settle</div>
                    <div class="listItem"><img src="https://cdn.pixelbin.io/v2/potlee/original/tick.png" />Pay
                        nothing right away
                    </div>
                </div>
            </div>
            <div class="select">
                <div> Select ${logoSVG("48")} at the payment screen
                </div>
            </div>
            <span class="declaration-text">*The above EMI schedule provided is an estimate. The exact schedule will be available at checkout.</span>
        </div>
        `;

    const html = `
        <div class="settleFont">
            <div class="card">
                <span class="header">
                    <span class="headerContent">
                    ${logoPosition === "left" ? logoSVG("50") : ""}
                    ${buttonText}
                    ${logoPosition !== "left" ? logoSVG("50") : ""}
                    </div>
                </span>
            </div>
            ${
              showModalPreview
                ? `
                    <div class="preview-modal-container">
                        ${modalContent}
                    </div>
                `
                : `
                    <div class="modal">
                        <div class="modal-center">
                            ${modalContent}
                        </div>
                    </div>
                `
            }

        </div>
        `;

    const widgetHtml = css + html;
    if (this.attributes.selector) {
      const targetElement = document.querySelector(this.attributes.selector);
      targetElement.innerHTML = widgetHtml;
    } else {
      this.shadowRoot.innerHTML = widgetHtml;
    }
  }

  setupEventListeners() {
    let card;
    let modal;
    let modalCenter;
    let closeModalButton;
    let body;

    if (this.attributes.selector) {
      const targetElement = document.querySelector(this.attributes.selector);
      card = targetElement.querySelector(".card");
      modal = targetElement.querySelector(".modal");
      modalCenter = targetElement.querySelector(".modal-center");
      closeModalButton = targetElement.querySelector(".close");
      body = document.querySelector("body");

      window.addEventListener("click", (event) => {
        this.handleModalClose(event, modal, modalCenter, body);
      });
    } else {
      card = this.shadowRoot.querySelector(".card");
      modal = this.shadowRoot.querySelector(".modal");
      modalCenter = this.shadowRoot.querySelector(".modal-center");
      closeModalButton = this.shadowRoot.querySelector(".close");
      body = document.querySelector("body");

      this.shadowRoot.addEventListener("click", (event) => {
        this.handleModalClose(event, modal, modalCenter, body);
      });
    }

    card.addEventListener("click", () => {
      if (modal) {
        modal.style.display = "block";
        body.style.overflow = "hidden";
      }
    });

    closeModalButton.addEventListener("click", () => {
      this.closeModal(modal, body);
    });

    document.addEventListener("keydown", (event) => {
      this.OnEscapePressed(event, modal, body);
    });
  }

  handleModalClose(event, modal, modalCenter, body) {
    if (event.target === modal || event.target === modalCenter) {
      this.closeModal(modal, body);
    }
  }

  OnEscapePressed = (event, modal, body) => {
    if (event.key === "Escape" || event.code === "Escape") {
      this.closeModal(modal, body);
    }
  };

  closeModal = (modal, body) => {
    if (modal) {
      modal.style.display = "none";
      body.style.overflow = "auto";
    }
  };
}

customElements.define("settle-widget", SettlePopupWidget);
