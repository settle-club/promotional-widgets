class SettlePopupWidget extends HTMLElement {
  defaultTheme = "rgb(1, 89, 79)";
  attributes = {
    selector: "",
    currency: "₹",
    "emi-tenure": [3],
    "total-order-value": "3000",
    "product-name": "Your Product Name	",
    "show-product-name": true,
    theme: this.defaultTheme,
    "logo-position": "right",
    "button-text": "Interest free monthly payments with",
    "show-modal-preview": false,
    "merchant-id": ""
  };
  initialRenderDone = false;
  countryCode = "+91";
  mobileNumber = "";
  showMobileInput = false;
  setShowMobileInput = () => { };
  errorMessage = "";
  setErrorMessage = "";
  mobileNumberRegex = /^[6-9]\d{9}$/gi;

  static get observedAttributes() {
    return [
      "currency",
      "emi-tenure",
      "total-order-value",
      "product-name",
      "show-product-name",
      "theme",
      "logo-position",
      "button-text",
      "show-modal-preview",
      "merchant-id"
    ];
  }

  constructor(props = {}) {
    super();
    [this.showMobileInput, this.setShowMobileInput] = this.createObservedVariable(false);
    [this.errorMessage, this.setErrorMessage] = this.createObservedVariable("");

    this.attributes = {
      ...this.attributes,
      ...props,
    };

    this.attachShadow({
      mode: "open"
    });
    if (props.selector) {
      this.renderAndBindListners();
    }
  }

  connectedCallback() {
    if (!this.initialRenderDone) {
      this.renderAndBindListners();
      this.initialRenderDone = true;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // During initialization, the attributeChangedCallback function is called for all observed attributes with null values.
    // To prevent unnecessary rendering during this initial setup, we add a check to ensure the render method is not called
    // until after the initial rendering has been completed. This avoids redundant calls and improves performance.
    if (oldValue !== newValue && this.initialRenderDone) {
      this.attributes[name] = newValue;
      this.renderAndBindListners();
    }
  }

  async renderAndBindListners(isModalOpen) {
    await this.render(isModalOpen);
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
      "https://cdn.pixelbin.io/v2/potlee/original/public/logos/settle/full-dark.svg";

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

      const svgBlob = new Blob([modifiedSVG], {
        type: "image/svg+xml"
      });
      const urlObject = URL.createObjectURL(svgBlob);

      return urlObject;
    } catch (error) {
      console.error("Error loading or modifying SVG:", error);
      return logoUrl;
    }
  };

  async render(isModalOpen = false) {
    const buttonText =
      this.getAttribute("button-text") ||
      this.attributes["button-text"] ||
      "Interest free monthly payments with";
    const currency =
      this.getAttribute("currency") || this.attributes.currency || "₹";
    const logoPosition =
      this.getAttribute("logo-position") ||
      this.attributes["logo-position"] ||
      "right";

    const totalOrderValue =
      this.getAttribute("total-order-value") ||
      this.attributes['total-order-value'] ||
      "3000";

    const productName =
      this.getAttribute("product-name") || this.attributes["product-name"] || "Your Product Name";
    const showProductName = eval(
      this.getAttribute("show-product-name") ||
      this.hasAttribute("show-product-name") ||
      this.attributes["show-product-name"] ||
      false
    );
    const showModalPreview = eval(
      this.getAttribute("show-modal-preview") ||
      this.hasAttribute("show-modal-preview") ||
      this.attributes["show-modal-preview"] ||
      false
    );

    const themeRGBColor =
      this.getAttribute("theme") || this.attributes.theme || this.defaultTheme;
    const lighterThemeColor = this.adjustBrightness(themeRGBColor, 10);

    const month1 = this.formatDate(1);
    const month2 = this.formatDate(2);
    const month3 = this.formatDate(3);

    const emiValue = Math.round(totalOrderValue / 3).toLocaleString("en-IN");

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

    const cssVariables = {
      scaleFactor: 0.8,
      initialModalWidth: "320px",
      initialFontSize: "16px",
      initialTitleFontSize: "26px",
      initialHeaderFontSize: "14px",
      initialProductNamefontsize: "12px",
      initialPieSize: "65px",
      initialPadding: "10px",
      initialMarginBottom: "8px",
      initialLogoHeight: "24px",
      initialLogoWidth: "24px",
    }

    this.appendFontLink();

    const css = ` 
                  <link rel="preconnect" href="https://fonts.googleapis.com">
                  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                  <style> 
                  :root {
                    --scale-factor: ${cssVariables?.scaleFactor};
                    --initial-modal-width: ${cssVariables?.initialModalWidth};
                    --initial-font-size: ${cssVariables?.initialFontSize};
                    --initial-title-font-size: ${cssVariables?.initialTitleFontSize};
                    --initial-header-font-size: ${cssVariables?.initialHeaderFontSize};
                    --initial-productName-font-size: ${cssVariables?.initialProductNamefontsize};
                    --initial-pie-size: ${cssVariables?.initialPieSize};
                    --initial-padding: ${cssVariables?.initialPadding};
                    --initial-margin-bottom: ${cssVariables?.initialMarginBottom};
                    --initial-logo-height: ${cssVariables?.initialLogoHeight};
                    --initial-logo-width: ${cssVariables?.initialLogoWidth};
                  }

                  body {
                    overflow: ${isModalOpen ? "hidden" : "auto"};
                  }

                  .settleFont {
                    font-family: Poppins !important;
                    margin: 0;
                  }

                  .card {
                    max-width: fit-content;
                    padding: calc(var(--initial-padding, ${cssVariables.initialPadding}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    cursor: pointer;
                    border-radius: 15px;
                    border: 2px solid ${themeRGBColor};
                    background-color: white;
                    margin-bottom: calc(var(--initial-margin-bottom, ${cssVariables?.initialMarginBottom}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                  }

                  .header {
                    font-size: calc(var(--initial-header-font-size, ${cssVariables?.initialHeaderFontSize}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    display: flex;
                    align-items: center;
                    font-weight: 400;
                  }

                  .headerContent {
                    margin: 3px 0;
                    gap: 4px;
                  }

                  .settleLogo {
                    height: calc(var(--initial-logo-height, ${cssVariables?.initialLogoHeight}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    width: calc(var(--initial-logo-width, ${cssVariables?.initialLogoWidth}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    margin-bottom: -3px;
                    color: ${themeRGBColor};
                  }

                  .svg-logo-container {
                    color: ${themeRGBColor};
                    display: inline-flex;
                  }

                  .content {
                    font-size: calc(var(--initial-font-size, ${cssVariables?.initialFontSize}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    color: rgb(106, 157, 106);
                    font-weight: 500;
                    z-index: 2147483647;
                  }

                  .modal {
                    display: ${isModalOpen ? "block" : "none"};
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
                    overflow: hidden;
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
                    padding: calc(22px * var(--scale-factor, ${cssVariables?.scaleFactor})) calc(20px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    min-width: calc(var(--initial-modal-width, ${cssVariables.initialModalWidth}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    border: 2px solid ${themeRGBColor};
                    border-radius: 20px;
                    display: grid;
                    gap: 14px;
                    box-sizing: content-box;
                    position: relative;
                    z-index: 2147483647;
                    margin: 0 auto;
                  }

                  .preview-modal-content {
                    margin-top: 14px;
                    z-index: 1;
                  }

                  .modal-content .settleLogo {
                    height: calc(var(--initial-logo-height, ${cssVariables?.initialLogoHeight}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    width: calc(var(--initial-logo-width, ${cssVariables?.initialLogoWidth}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                  }

                  .productName {
                    width: fit-content;
                    background-color: #F5F5F5;
                    font-size: calc(var(--initial-productName-font-size, ${cssVariables?.initialProductNamefontsize}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    font-weight: normal;
                    padding: calc(9px * var(--scale-factor, ${cssVariables?.scaleFactor})) calc(8px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    border-radius: 12px;
                  }

                  .orderDetails {
                    padding-top: calc(8px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                  }

                  .orderDetails .title {
                    font-size: calc(var(--initial-title-font-size, ${cssVariables?.initialTitleFontSize}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    font-weight: 600;
                    line-height: 130%;
                  }

                  .orderDetails .title .emiValue {
                    color: ${themeRGBColor};
                  }

                  .totalOrder {
                    border: 1px solid ${themeRGBColor};
                    border-radius: 14px;
                    padding: calc(6px * var(--scale-factor, ${cssVariables?.scaleFactor})) calc(14px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    display: grid;
                    justify-content: center;
                    height: max-content;
                    scale: var(--scale-factor, ${cssVariables?.scaleFactor});
                  }

                  .totalOrder .value {
                    color: #3F3F3F;
                    font-size: calc(var(--initial-title-font-size, ${cssVariables?.initialTitleFontSize}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    font-weight: 600;
                    line-height: 130%;
                  }

                  .totalOrder .subtitle {
                    color: #575757;
                    font-size: calc(var(--initial-header-font-size, ${cssVariables?.initialHeaderFontSize}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    font-weight: normal;
                    text-align: center;
                  }

                  .emis {
                    margin-top: calc(6px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    padding: calc(6px * var(--scale-factor, ${cssVariables?.scaleFactor})) calc(10px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    display: flex;
                    justify-content: space-around;
                    gap: calc(6px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    flex-wrap: wrap;
                  }

                  .emiOption {
                    display: grid;
                    gap: calc(10px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    justify-items: center;
                  }

                  .pie1,
                  .pie2,
                  .pie3 {
                    width: calc(var(--initial-pie-size, ${cssVariables?.initialPieSize}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    height: calc(var(--initial-pie-size, ${cssVariables?.initialPieSize}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    border-radius: 50%;
                    border: 1px solid #D1D1D1;
                  }

                  .pie1 {
                    background-image: conic-gradient(${themeRGBColor} 33%, white 33%);
                  }

                  .pie2 {
                    background-image: conic-gradient(${themeRGBColor} 66%, white 66%);
                  }

                  .pie3 {
                    background-image: conic-gradient(${themeRGBColor} 100%, white 0%);
                  }

                  .emiOption .emiValue {
                    font-size: calc(var(--initial-productName-font-size, ${cssVariables?.initialProductNamefontsize}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    text-align: center;
                  }

                  .features {
                    padding: calc(6px * var(--scale-factor, ${cssVariables?.scaleFactor})) calc(14px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    display: flex;
                    justify-content: space-between;
                    font-size: calc(var(--initial-header-font-size, ${cssVariables?.initialHeaderFontSize}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    font-weight: 300;
                    color: #5a5a5a;
                    gap: calc(12px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                  }

                  .features .text {
                    max-width: calc(80px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    text-align: center;
                  }

                  .steps .title {
                    font-size: calc(18px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    font-weight: 500;
                    margin-top: calc(12px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                  }

                  .steps .list {
                    display: grid;
                    gap: calc(14px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    font-size: calc(var(--initial-header-font-size, ${cssVariables?.initialHeaderFontSize}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    font-weight: 400;
                    color: #505050;
                    margin: calc(16px * var(--scale-factor, ${cssVariables?.scaleFactor})) 0;
                  }

                  .steps .listItem {
                    display: flex;
                    align-items: center;
                    gap: calc(10px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                  }

                  .steps .listItem img {
                    width: calc(28px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                  }

                  .onboard-with-settle-link {
                    color: blue;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: calc(2px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    padding: 0;
                    border: none;
                    background: none;
                    border-bottom: 1px solid blue;
                  }

                  .redirect-svg {
                    height: calc(var(--initial-logo-height, ${cssVariables?.initialLogoHeight}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    width: calc(var(--initial-logo-width, ${cssVariables?.initialLogoWidth}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                  }

                  .mobile-container {
                    display: flex;
                  }

                  .mobile-container input {
                    padding: calc(8px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                  }

                  .mobile-container .country-code-label {
                    width: calc(45px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    border: 1px solid gray;
                    border-radius: 2px 0px 0px 2px;
                    border-right: 0;
                    align-items: center;
                    justify-content: center;
                    display: flex;
                    background-color: ${lighterThemeColor};
                  }

                  .mobile-container .mobile-input {
                    width: calc(120px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    flex: 1;
                    border-radius: 0px 2px 2px 0px;
                    outline: 0px !important;
                    border: 1px solid gray;

                    input::placeholder {
                      font-size: calc(var(--initial-font-size, ${cssVariables?.initialFontSize}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    }
                  }

                  .mobile-container button {
                    background: ${themeRGBColor};
                    border: 1px solid ${themeRGBColor};
                    border-radius: 2px;
                    cursor: pointer;
                    margin-left: calc(6px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                  }

                  .error-message {
                    color: red;
                    font-size: calc(12px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                  }

                  .select {
                    width: -webkit-fill-available;
                    padding: calc(16px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    font-size: calc(var(--initial-header-font-size, ${cssVariables?.initialHeaderFontSize}) * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    text-align: center;
                    border-radius: 20px;
                    background-color: ${lighterThemeColor};
                  }

                  .select img {
                    margin-bottom: calc(-1px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                  }

                  .close {
                    color: rgba(0, 0, 0, 0.537);
                    float: right;
                    font-size: calc(24px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    font-weight: 200;
                    background-color: #e1e1e1;
                    width: fit-content;
                    height: calc(19px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    display: flex;
                    align-items: center;
                    padding: calc(4px * var(--scale-factor, ${cssVariables?.scaleFactor})) calc(6px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    border-radius: 50%;
                    position: absolute;
                    right: calc(15px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    top: calc(17px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    cursor: pointer;
                  }

                  .declaration-text {
                    font-size: calc(0.5em * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    color: rgb(217, 214, 214);
                    font-style: italic;
                    min-width: fit-content;
                    width: min-content;
                  }

                  /* Media Query for Mobile Devices */
                  @media (max-width: 365px) {
                    .modal-content {
                      min-width: calc(250px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    }

                    .preview-modal-content {
                      margin-top: calc(14px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    }
                  }

                  @media (max-width: 300px) {
                    .modal-content {
                      min-width: auto;
                    }
                  }

                  @media (max-width: 320px),
                  (max-height: 700px) {
                    .preview-modal-content {
                      margin-top: calc(14px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    }
                  }

                  @media (max-width: 240px),
                  (max-height: 530px) {
                    .modal-content {
                      margin-top: calc(300px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    }

                    .preview-modal-content {
                      margin-top: calc(14px * var(--scale-factor, ${cssVariables?.scaleFactor}));
                    }
                  }

                  </style>
                `

    const redirectSvg = `
  <span class="redirect-svg">
    <svg
      class="w-6 h-6 text-gray-800 dark:text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778"
      />
    </svg>
    </span>
  `

    const modalContent = `
      <div class="modal-content ${showModalPreview ? "preview-modal-content" : ""}">
          ${logoSVG()}
          <div class="close">&times;</div>
          ${showProductName && productName
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
                  <div class="listItem"><img src="https://cdn.pixelbin.io/v2/potlee/original/tick.png" />
                    <span class="onboard-with-settle-link" >Onboard with Settle ${redirectSvg}</span>
                  </div>
                  ${this.renderMobileInput()}
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
                  </span>
              </span>
          </div>
          ${showModalPreview
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

  formatDate = (monthsAhead) => {
    const today = new Date();
    const futureDate = new Date(
      today.setMonth(today.getMonth() + monthsAhead)
    );
    return futureDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  appendFontLink = () => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';
    fontLink.rel = 'stylesheet';
    fontLink.type = 'text/css';
    document.head.appendChild(fontLink);
  }

  renderMobileInput = () => {
    if (!this.showMobileInput() || !window.FPI) {
      return ""
    }

    return `
        <div>
          <div class="mobile-container">
            <span class="country-code-label">${this.countryCode}</span>
            <input class="mobile-input" name="mobile" placeholder="Mobile number" value=${this.mobileNumber}></input>
            <button class="submit-mobile" type="submit"> Send </button>
          </div>
          <span class="error-message">${this.errorMessage()}</span>
        </div>
        `
  }

  setupEventListeners() {
    let card;
    let modal;
    let modalCenter;
    let closeModalButton;
    let body;
    let settleOnboardLink;
    let submitMobileButton;

    if (this.attributes.selector) {
      const targetElement = document.querySelector(this.attributes.selector);
      card = targetElement.querySelector(".card");
      modal = targetElement.querySelector(".modal");
      modalCenter = targetElement.querySelector(".modal-center");
      closeModalButton = targetElement.querySelector(".close");
      body = document.querySelector("body");
      settleOnboardLink = targetElement.querySelector(".onboard-with-settle-link")
      submitMobileButton = targetElement.querySelector(".submit-mobile")

      window.addEventListener("click", (event) => {
        this.handleModalClose(event, modal, modalCenter, body);
      });
    } else {
      card = this.shadowRoot.querySelector(".card");
      modal = this.shadowRoot.querySelector(".modal");
      modalCenter = this.shadowRoot.querySelector(".modal-center");
      closeModalButton = this.shadowRoot.querySelector(".close");
      body = document.querySelector("body");
      settleOnboardLink = this.shadowRoot.querySelector(".onboard-with-settle-link")
      submitMobileButton = this.shadowRoot.querySelector(".submit-mobile")

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
      this.onEscapePressed(event, modal, body);
    });

    settleOnboardLink.addEventListener("click", () => this.handleOnboardToSettle(false))
    submitMobileButton?.addEventListener("click", () => this.handleOnboardToSettle(true))
  }

  handleModalClose(event, modal, modalCenter, body) {
    if (event.target === modal || event.target === modalCenter) {
      this.closeModal(modal, body);
    }
  }

  onEscapePressed = (event, modal, body) => {
    if (event.key === "Escape" || event.code === "Escape") {
      this.closeModal(modal, body);
    }
  };

  closeModal = (modal, body) => {
    if (modal) {
      modal.style.display = "none";
      body.style.overflow = "auto";
    }

    this.mobileNumber = "";
    this.setErrorMessage("", false);
    this.setShowMobileInput(false, false);
  };

  handleOnboardToSettle = async (fromSubmit = false) => {
    try {
      if (!window?.FPI) {
        const merchantId = this.getAttribute("merchant-id") || this?.attributes["merchant-id"]
        if (merchantId) {
          window.open(`https://account.settle.club/${merchantId}`, "_blank");
        } else {
          window.open("https://account.settle.club/", "_blank");
        }
        return
      }

      const appId = window?.FPI?.state?.global?.appFetaure?._data?.feature?.app || ""

      let customer = {};
      const endUser = window?.FPI?.state?.user?._data || {}
      const endUserPhoneNumber = endUser?.phone_numbers?.find((phoneNumber) => phoneNumber?.primary || phoneNumber?.verified || phoneNumber?.active)
      if (endUserPhoneNumber) {
        customer = {
          countryCode: endUserPhoneNumber?.country_code || "",
          mobile: endUserPhoneNumber?.phone || "",
          uid: endUser?.user_id || ""
        };
      } else if (this.showMobileInput()) {
        if (fromSubmit) {
          let mobileInput = document.querySelector(".mobile-input");

          if (this.attributes.selector) {
            const targetElement = document.querySelector(this.attributes.selector);
            mobileInput = targetElement.querySelector(".mobile-input")
          } else {
            mobileInput = this.shadowRoot.querySelector(".mobile-input")
          }

          customer = {
            countryCode: this.countryCode || "",
            mobile: mobileInput?.value || "",
            uid: Math.floor(Math.random() * 9000000000) + 1000000000
          };

          this.mobileNumber = customer?.mobile
          mobileInput.value = customer?.mobile

          if ((!customer.mobile || !this.mobileNumberRegex?.test(customer.mobile))) {
            this.setErrorMessage("Please Enter Valid Mobile number")
            return;
          }
        } else {
          this.setShowMobileInput(false)
          return
        }
      } else {
        this.setShowMobileInput(!this.showMobileInput())
        return
      }

      if (customer.mobile && this.errorMessage()) {
        this.setErrorMessage("")
      }

      let currentPageUrl
      try {
        currentPageUrl = window.top.location.href
      } catch (error) {
        currentPageUrl = window?.location?.href
      }

      const boomerangRedirectUrl = `${window.location.protocol}//${window.location.hostname}/application/${appId}/store-session?clientRedirectUrl=${currentPageUrl}`

      const payload = {
        customer: customer,
        redirectUrl: boomerangRedirectUrl || "",
        device: {
          ipAddress: await this.generateIP() || "",
          userAgent: navigator?.userAgent || ""
        }
      }

      const redirectUrl = await this.handleLinkCustomer(appId, payload);
      window.open(redirectUrl, "_self");
      this.setShowMobileInput(false)
    } catch (error) {
      const message = "Enable to process with settle."
      console.error(message, error)
      this.setErrorMessage(message)
    }
  }

  generateIP = async () => {
    try {
      const response = await fetch("https://ipinfo.io/json");
      const data = await response.json();
      return data.ip || null;
    } catch (err) {
      console.log("Error finding IP");
      return ""
    }
  }

  handleLinkCustomer = async (appId, payload) => {
    try {
      const apiDomain = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
      const settleUrl = `${apiDomain}/api/v1/link_customer/${appId}`

      const response = await fetch(settleUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response?.status === 200) {
        const redirectUrlRes = await response?.json()
        return redirectUrlRes?.data?.redirectUrl
      } else {
        throw new Error("Error while redirecting on settle website.")
      }
    } catch (error) {
      console.log("Error while linking a customer", error);
      throw error
    }
  }

  createObservedVariable = (defaultValue, callbackFunc = () => { }) => {
    let propertyValue = defaultValue

    const setValue = (updatedValue, isModalOpen = true) => {
      const oldValue = propertyValue
      propertyValue = updatedValue
      callbackFunc(updatedValue);

      this.reRenderUI(oldValue, propertyValue, isModalOpen)
    }

    const getValue = () => propertyValue;

    return [
      getValue,
      setValue,
    ]
  }

  reRenderUI = (oldValue, updatedValue, isModalOpen = false) => {
    this.renderAndBindListners(isModalOpen);
  }
}

customElements.define("settle-widget", SettlePopupWidget);