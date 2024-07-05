class SettlePopupWidget extends HTMLElement {
  defaultTheme = "rgb(1, 89, 79)";
  attributes = {
    selector: "",
    currency: "₹",
    "emi-tenure": [3, 6, 9],
    "total-order-value": "3000",
    "product-name": "Your Product Name	",
    "show-product-name": false,
    "show-product-image": false,
    "show-suggested": true,
    "suggested-month": 6,
    "product-image": "",
    theme: this.defaultTheme,
    "logo-position": "right",
    "button-text": "Interest free monthly payments with",
    "show-modal-preview": false,
  };

  static get observedAttributes() {
    return [
      "currency",
      "emi-tenure",
      "total-order-value",
      "product-name",
      "product-image",
      "show-product-name",
      "show-product-image",
      "show-suggested",
      "suggested-month",
      "theme",
      "logo-position",
      "button-text",
      "show-modal-preview",
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

  calculateContrastColor(rgb) {
    // Parse the RGB color code
    const regex = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
    const rgbCodeParts = regex.exec(rgb);
    if (!rgbCodeParts) {
      console.error("Invalid RGB color format");
      return "#000"; // Default to black
    }

    const r = parseInt(rgbCodeParts[1]);
    const g = parseInt(rgbCodeParts[2]);
    const b = parseInt(rgbCodeParts[3]);

    // Calculate the brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000" : "#fff"; // Black text for light backgrounds, white text for dark backgrounds
  }

  async render() {
    const buttonText =
      this.getAttribute("button-text") ||
      this.attributes["button-text"] ||
      "Interest free monthly payments with";
    const currency =
      this.getAttribute("currency") || this.attributes.currency || "₹";

    this.attributes.currency = currency;

    const logoPosition =
      this.getAttribute("logo-position") ||
      this.attributes["logo-position"] ||
      "right";

    const totalOrderValue =
      this.getAttribute("total-order-value") ||
      this.attributes["total-order-value"] ||
      "0";

    this.attributes["total-order-value"] = totalOrderValue;

    const productName =
      this.getAttribute("product-name") ||
      this.attributes["product-name"] ||
      "Your Product Name";

    const productImage =
      this.getAttribute("product-image") || this.attributes["product-image"] || "";

    const showProductName = eval(
      this.getAttribute("show-product-name") ||
        this.hasAttribute("show-product-name") ||
        this.attributes["show-product-name"] ||
        false
    );

    const showProductImage = eval(
      this.getAttribute("show-product-image") ||
        this.hasAttribute("show-product-image") ||
        this.attributes["show-product-image"] ||
        false
    );

    const showSuggested = eval(
      this.getAttribute("show-suggested") ||
        this.hasAttribute("show-suggested") ||
        this.attributes["show-suggested"]
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
    const contrastColor = this.calculateContrastColor(themeRGBColor);

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

    let emiTenure = this.getAttribute("emi-tenure") ||
      this.attributes["emi-tenure"] || [3, 6, 9, 12];
      
      emiTenure = Array.isArray(emiTenure) ? emiTenure.map(Number) : JSON.parse(emiTenure);
      this.attributes["emi-tenure"] = emiTenure;


    let suggestedMonth =
      this.getAttribute("suggested-month") ||
      this.attributes["suggested-month"] ||
      6;
      suggestedMonth = Number(suggestedMonth);

    if (!emiTenure.includes(suggestedMonth)) {
      suggestedMonth = emiTenure[0];
    }

    const screenWidth = window.innerWidth;
    const scale =
      screenWidth <= 360 || totalOrderValue.length >= 5
        ? "scale(0.8)"
        : "scale(1)";

    const logo = await this.loadAndModifySVG(themeRGBColor);
    const logoSVG = (width = "148") => {
      return `
            <img 
              src='${logo}' 
              alt="settle logo"             
              class="svg-logo" 
              style="width:${width}px">
            </img>
        `;
    };

    const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none" style="color: ${themeRGBColor};">
            <path d="M17.9905 18H18M17.9905 18C17.3678 18.6175 16.2393 18.4637 15.4479 18.4637C14.4765 18.4637 14.0087 18.6537 13.3154 19.347C12.7251 19.9374 11.9337 21 11 21C10.0663 21 9.27492 19.9374 8.68457 19.347C7.99128 18.6537 7.52349 18.4637 6.55206 18.4637C5.76068 18.4637 4.63218 18.6175 4.00949 18C3.38181 17.3776 3.53628 16.2444 3.53628 15.4479C3.53628 14.4414 3.31616 13.9786 2.59938 13.2618C1.53314 12.1956 1.00002 11.6624 1 11C1.00001 10.3375 1.53312 9.8044 2.59935 8.73817C3.2392 8.09832 3.53628 7.46428 3.53628 6.55206C3.53628 5.76065 3.38249 4.63214 4 4.00944C4.62243 3.38178 5.7556 3.53626 6.55208 3.53626C7.46427 3.53626 8.09832 3.2392 8.73815 2.59937C9.8044 1.53312 10.3375 1 11 1C11.6625 1 12.1956 1.53312 13.2618 2.59937C13.9015 3.23907 14.5355 3.53626 15.4479 3.53626C16.2393 3.53626 17.3679 3.38247 17.9906 4C18.6182 4.62243 18.4637 5.75559 18.4637 6.55206C18.4637 7.55858 18.6839 8.02137 19.4006 8.73817C20.4669 9.8044 21 10.3375 21 11C21 11.6624 20.4669 12.1956 19.4006 13.2618C18.6838 13.9786 18.4637 14.4414 18.4637 15.4479C18.4637 16.2444 18.6182 17.3776 17.9905 18Z" stroke="#01594F" stroke-width="0.8" style="stroke: currentColor;" />
            <path d="M8.00012 11.8929L9.80012 13.5L14.0001 8.5" stroke="#01594F" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" style="stroke: currentColor;" />
          </svg>
        `;

    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap';
    fontLink.rel = 'stylesheet';
    fontLink.type = 'text/css';
    document.head.appendChild(fontLink);

    const css = `
   
         <style>

        .settleFont {
          font-family: "Rubik", sans-serif !important;
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

        .headerContent img {
          padding-top: 1px;
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
            min-width: 507px;
            border: 2px solid ${themeRGBColor};
            border-radius: 30px;
            box-sizing: content-box;
            position: relative;
            transform: ${scale};
            z-index: 2147483647;
            margin: 0 auto;
            box-shadow: 4px 4px 20px 0px rgba(0, 0, 0, 0.12);
        }

        .container {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 24px;
        }

        .preview-modal-content {
            margin-top: 14px;
            // z-index: 2147483640; 
            z-index: 1; 
        }

        .modal-content .settleLogo {            
            height: 24px;
        }

        .productContainer {
            background-color: #F7F8FA;
            display: flex;
            padding: 8px;
            gap: 10px;
            align-items: center;
        }

        .productImage {
            width: 40px;
            height: 40px;
            object-fit: contain;
            background-color: white;
        }

        .productName {
              font-size: 14px;
              font-weight: 400;
              max-width: 100%;
              line-height: 18px;
        }

        .orderDetails {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }

        .orderDetails .title {
            font-size: 32px;
            font-weight: 400;
            line-height: 36.8px;
            transform:${scale};
        }

        .orderDetails .title .emiValue {
            color: ${themeRGBColor}
        }

        .totalOrder {
            border: 1px solid ${themeRGBColor};
            border-radius: 8px;
            transform:${scale};
            width: 198px;
            height: 87px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
        }

        .totalOrder .value {
            color: #3F3F3F;
            font-size: 40px;
            font-weight: 500;
            line-height: 46px;
        }

        .totalOrder .subtitle {
            color: #575757;
            font-size: 20px;
            line-height: 23px;
            font-weight: 500;
            letter-spacing: -0.2px;
        }

        .emis {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .emiOption {
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin-top: ${showSuggested ? "15px" : "0px"} ;
            gap: 20px
        }

        .emiOption .emi-duration-btn {
            font-size: 16px;
            line-height: 21px;
            padding: 8px 19px;
            border: 1px solid ${themeRGBColor};
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            flex-grow: 1;
            text-align: center;
        }

        .badge {
                margin: 0;
                position: absolute;
                font-size: 10px;
                line-height: 11px;
                z-index: -10;
                top: -20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 6px 13px 3px;
                background-color: ${lighterThemeColor};
                color: black;
                border-top-right-radius: 10px;
                border-top-left-radius: 10px;
                display: flex;
                gap: 4px;
                align-items: center;
          }

        .emi-duration-btn.active {
            background: ${themeRGBColor};
            color: ${contrastColor};
        }

        .emiDates {
            padding: 13px 26px 13px 8px;
            max-height: 115px;
            background-color: #F7F8FA;
            border-radius: 6px;
            overflow-y: auto;
        }

        .emi-list .emi-item:first-child .date-price {
            color: #505050 !important;
        }

        .emi-item .emi-date {
            flex: 1;
        }

        .emi-item .emi-amount {
            flex: 1;
            text-align: right;
            font-weight: 500;
        }

        .emi-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .emi-item {
            display: flex;
            align-items: center;
            gap: 16px;
        
        }

        .date-price {
            display: flex;
            justify-content: space-between;
            width: 237px;
            font-size: 14px;
            color: #1F2024;
        }

        .tick {
              font-size: 7.5px;
              background-color: ${themeRGBColor};
              border-radius: 50%;
              color: white;
              height: 17.1px;
              width: 17.1px;
              display: flex;
              justify-content: center;
              align-items: center;
            }

        .emi-count {
            font-size: 10px;
            border-radius: 50%;
            color: black;
            position: relative;
            border: 1px solid ${themeRGBColor};
            width: 15px;
            height: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .emi-count span {
            position: absolute;
            top: -16px;
            color: #DBD4DA;
            left: 6px;
        }

        /* Webkit-based browsers (Chrome, Safari) */
          .emiDates::-webkit-scrollbar {
            width: 3px; /* Change the width of the scrollbar */
          }

          .emiDates::-webkit-scrollbar-track {
            background: #ECEAEC; /* Change the background color of the scrollbar track */
          }

          .emiDates::-webkit-scrollbar-thumb {
            background-color: #C1B8BF; /* Change the color of the scrollbar thumb */
            border-radius: 10px; /* Make the scrollbar thumb rounded */
          }

        .steps-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 36px;
        }

        .steps-head .title {
            font-size: 18px;
            font-weight: 400;
            line-height: 27px;
            color: #505050;
        }

        .steps {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .onboard a {
            color: ${themeRGBColor};        
            font-size: 14px;
            line-height: 15.4px;
            text-decoration: none;
            text-transform: uppercase;
            padding: 10.5px 12px;
            border: 1px solid ${themeRGBColor};
            border-radius: 6px;
        }

          .list-container {
            padding: 12px;
            background-color: ${lighterThemeColor};
            border-radius: 10px;
          }

        .steps .list {
            display: flex;
            gap: 31.5px;
            font-size: 14px;
            font-weight: 400;
            color: #1F2024;
        }

        .steps .listItem {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 140px;
            line-height: 18px;
        }

        .top-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .close {
            color: #6C6069;
            font-size: 17px;
            font-weight: 200;
            border: 1px solid #6C6069;
            width: 19px;
            height: 19px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            cursor: pointer;
            margin-bottom: 1px;
        }

        .footer {
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-bottom-left-radius: 30px;
            border-bottom-right-radius: 30px;
            height: 137px;
            background-image: url("https://cdn.pixelbin.io/v2/potlee/original/public/banners/settle-widget-footer-desktop.png");
            background-size: cover;
            background-position: center;
          }

        /* Media Query for Mobile Devices */
        @media (max-width: 426px) {
            .modal-content {
                min-width: 343px;
                max-width: 343px;
                margin-top: 150px !important;
                transform: scale(1) !important;
            }

            .top-container img {
              width: 74px !important;
            }

            .orderDetails .title {
                font-size: 24px;
                line-height: 27.6px;
            }

            .totalOrder {
                padding: 0 14.5px;
                height: 73px;
                width: fit-content;
            }

            .totalOrder .value {
                font-size: 32px;
                line-height: 36.8px;
            }

            .totalOrder .subtitle {
                font-size: 12px;
                line-height: 15.6px;
            }

            .preview-modal-content {
                margin-top: 14px;
            }

            .productName {
              width: 100%;
            }

            .emi-duration-btn .month-no {
                font-size: 16px;
                line-height: 20.4px;
                font-weight: 500;
            }

            .hide {
                display: none;
            }

            .steps-head .title {
                font-size: 12px;
                line-height: 15.6px;
                
            }

            .onboard a {
                font-size: 12px;
                padding: 6px 10px;
            }

            .list-container {
                padding: 16px 8px;
            }

            .steps .list {
                gap: 16px;
                font-size: 10px;
            }

            .steps .listItem {
                width: fit-content;
                line-height: 11px;
            }

            .footer {
              background-image: url("https://cdn.pixelbin.io/v2/potlee/original/public/banners/settle-widget-footer-mobile.png");
            }
          }

        @media (min-width: 460px) and (max-width: 1100px) {
            .modal-content {
              transform: scale(0.85);
            }
          }

          @media (max-height: 750px) {
            .modal-content {
              transform: scale(0.85);
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
          <div class="container">
            <div class="top-container">
            ${logoSVG()}
            <div class="close">&times;</div>
            </div>

            <div class="orderDetails">
                <div class="title">
                    Start as <br />
                    Low as <span class="emiValue">${currency}${(
      totalOrderValue / emiTenure[emiTenure.length - 1]
    ).toFixed(0)}</span>
                </div>
                <div class="totalOrder">
                    <div class="value">${currency}${totalOrderValue}</div>
                    <div class="subtitle">Order total</div>
                </div>
            </div>

            ${
              showProductName && productName
                ? `
                <div class="productContainer">
                  ${
                    showProductImage && productImage
                      ? `
                      <img class="productImage" src=${productImage} alt="product image">
                      `
                      : ``
                  }
                  <div class="productName">
                      ${productName}
                  </div>
                </div>
                `
                : ``
            }

            <div class="emis">
              <div class="emiOption">
                ${emiTenure
                  .map(
                    (month) => `
                  <span class="emi-duration-btn" data-months=${month}>
                  ${
                    showSuggested && suggestedMonth === month
                      ? `
                    <p class="badge">&#9733; <span class="hide">SUGGESTED</span></p>
                  `
                      : ``
                  }
                  <span class="month-no">${month}</span> months
                  </span>
                `
                  )
                  .join("")}
              </div>
              
              <div class="emiDates">
                <div class="emi-list"></div>
              </div>
            </div>

            <div class="steps">
                <div class="steps-head">
                  <div class="title">Steps to perform: </div>
                  <div class="onboard">
                    <a href="#">Onboard in Settle</a>
                  </div>
                </div>
                <div class="list-container">
                  <div class="list">
                    <div class="listItem">
                      ${svg}
                      <span>Add Items <br/> to cart</span>
                    </div>
                    <div class="listItem">
                      ${svg}
                      <span>Checkout <br/> with Settle</span>
                    </div>
                    <div class="listItem">
                      ${svg}
                      <span>Pay nothing <br/> right away</span>
                    </div>
                  </div>
                </div>
            </div>
          </div>
          <div class="footer">
              
          </div>
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
    let body = document.querySelector("body");
    let emiBtns;
    let emiList;
    let badge;

    if (this.attributes.selector) {
      const targetElement = document.querySelector(this.attributes.selector);
      card = targetElement.querySelector(".card");
      modal = targetElement.querySelector(".modal");
      modalCenter = targetElement.querySelector(".modal-center");
      closeModalButton = targetElement.querySelector(".close");
      emiBtns = document.querySelectorAll(".emi-duration-btn");
      emiList = document.querySelector(".emi-list");
      badge = document.querySelector(".badge");

      window.addEventListener("click", (event) => {
        this.handleModalClose(event, modal, modalCenter, body);
      });
    } else {
      card = this.shadowRoot.querySelector(".card");
      modal = this.shadowRoot.querySelector(".modal");
      modalCenter = this.shadowRoot.querySelector(".modal-center");
      closeModalButton = this.shadowRoot.querySelector(".close");
      emiBtns = this.shadowRoot.querySelectorAll(".emi-duration-btn");
      emiList = this.shadowRoot.querySelector(".emi-list");
      badge = this.shadowRoot.querySelector(".badge");

      this.shadowRoot.addEventListener("click", (event) => {
        this.handleModalClose(event, modal, modalCenter, body);
      });
    }

    if (badge) {
      const parentElem = badge.parentElement;

      parentElem.classList.add("active");
      const months = parentElem.getAttribute("data-months");
      this.updateEMIDetails(months, emiList);
    } else {
      emiBtns[0].classList.add("active");
      const months = emiBtns[0].getAttribute("data-months");
      this.updateEMIDetails(months, emiList);
    }

    emiBtns.forEach((button) => {
      button.addEventListener("click", (event) => {

        // Remove active class from all buttons
        emiBtns.forEach((btn) => btn.classList.remove("active"));
        // Add active class to the clicked button
        button.classList.add("active");

        // Get the number of months from the clicked button
        const months = button.getAttribute("data-months");

        // Calculate EMI details
        this.updateEMIDetails(months, emiList);
      });
    });

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

  updateEMIDetails(months, emiList) {
    const emiAmount =
      parseInt(this.attributes["total-order-value"] / months) || 0; // Example EMI amount, adjust as needed

    const today = new Date();
    const emiDates = [];

    for (let i = 1; i <= months; i++) {
      const emiDate = new Date(today);
      emiDate.setMonth(today.getMonth() + i);
      emiDates.push(
        emiDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      );
    }

    // Clear previous EMI details
    emiList.innerHTML = `<div class="emi-item">
                    <span class="tick"> ✓ </span>
                    <div class="date-price">
                      <span>Today</span>
                      <span>Nothing to pay</span>
                    </div>
                  </div>`;

    // Add new EMI details
    emiDates.forEach((date, i) => {
      const emiItem = document.createElement("div");
      emiItem.classList.add("emi-item");

      const emiCount = document.createElement("span");
      emiCount.classList.add("emi-count");
      emiCount.innerHTML = `<span>|</span> ${i + 1}`;

      const emiDateElem = document.createElement("span");
      emiDateElem.classList.add("emi-date");
      emiDateElem.textContent = date;

      const emiAmountElem = document.createElement("span");
      emiAmountElem.classList.add("emi-amount");
      emiAmountElem.textContent = `${
        this.attributes.currency
      }${emiAmount.toFixed(2)}`;

      const dateAmtDiv = document.createElement("div");
      dateAmtDiv.classList.add("date-price");

      dateAmtDiv.appendChild(emiDateElem);
      dateAmtDiv.appendChild(emiAmountElem);

      emiItem.appendChild(emiCount);
      emiItem.appendChild(dateAmtDiv);
      emiList.appendChild(emiItem);
    });
  }
}

customElements.define("settle-widget", SettlePopupWidget);
