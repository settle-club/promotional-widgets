# Basic Widget

### Default Configuration

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Default Widget Example</title>
    <script
      src="https://cdn.pixelbin.io/v2/potlee/original/settle-widget.js"
      defer
    ></script>
  </head>
  <body>
    <settle-widget total-order-value="1200" />
  </body>
</html>
```

#### Result:
![Default Widget Preview](https://cdn.pixelbin.io/v2/potlee/original/public/documentation/settle-widget/settle-widget-card.png)

![Default Widget Preview](https://cdn.pixelbin.io/v2/potlee/original/public/documentation/settle-widget/settle-widget.png)

### Custom Configuration

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Custom Widget Example</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script
      src="https://cdn.pixelbin.io/v2/potlee/original/settle-widget.js"
      defer
    ></script>
  </head>
  <body>
    <div id="settle-widget-container"></div>
    <settle-widget
      total-order-value="1200"
      selector="#settle-widget-container"
      button-text="in flexible installments"
      logo-position="left"
      theme="rgb(0, 0, 0)"
      product-name="Black T-Shirt"
    />
  </body>
</html>
```

#### Result:
![Default Widget Preview](https://cdn.pixelbin.io/v2/potlee/original/public/documentation/settle-widget/custom-settle-widget-card.png)

![Default Widget Preview](https://cdn.pixelbin.io/v2/potlee/original/public/documentation/settle-widget/custom-settle-widget.png)
