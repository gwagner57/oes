/**
* SVG library
* @author Gerd Wagner
*/
var svg = {
  NS: "http://www.w3.org/2000/svg",  // namespace
  XLINK_NS: "http://www.w3.org/1999/xlink",
  /**
  * Create an SVG element
  * 
  * @param {object} params  a lsit of optional parameters
  * @return {node} svgElement
  */
  createSVG: function (params) {
    const el = document.createElementNS( svg.NS,"svg");
    el.setAttribute("version", "1.1");
    el.setAttribute("width", params.width || "100%");
    el.setAttribute("height", params.height || "100%");
    if (params.id) el.id = params.id;
    if (params.class) el.className = params.class;
    if (params.viewBox) el.setAttribute("viewBox", params.viewBox);
    return el;
  },
  createDefs: function () {
    return document.createElementNS( svg.NS,"defs");
  },
  setOptionalAttr: function (el, optParams) {
    if (optParams === undefined) optParams = {};
    if (optParams.id) el.id = optParams.id;
    if (optParams.class) el.className = optParams.class;
    el.setAttribute("stroke", optParams.stroke || "black");
    el.setAttribute("stroke-width", optParams.strokeWidth || "1");
    el.setAttribute("fill", optParams.fill || "white");
  },
  createRect: function (x, y, width, height, optParams) {
    const el = document.createElementNS( svg.NS,"rect");
    el.setAttribute("x", x);
    el.setAttribute("y", y);
    el.setAttribute("width", width);
    el.setAttribute("height", height);
    svg.setOptionalAttr( el, optParams);
    return el;
  },
  createCircle: function ( cx, cy, r, optParams) {
    const el = document.createElementNS( svg.NS,"circle");
    el.setAttribute("cx", cx);
    el.setAttribute("cy", cy);
    el.setAttribute("r", r);
    svg.setOptionalAttr( el, optParams);
    return el;
  },
  createLine: function (x1, y1, x2, y2, optParams) {
    const el = document.createElementNS( svg.NS,"line");
    el.setAttribute("x1", x1);
    el.setAttribute("y1", y1);
    el.setAttribute("x2", x2);
    el.setAttribute("y2", y2);
    svg.setOptionalAttr( el, optParams);
    return el;
  },
  createPath: function (d, optParams) {
    const el = document.createElementNS( svg.NS,"path");
    el.setAttribute("d", d);
    svg.setOptionalAttr( el, optParams);
    return el;
  },
  createGroup: function (optParams) {
    const el = document.createElementNS( svg.NS,"g");
    svg.setOptionalAttr( el, optParams);
    return el;
  },
  createText: function ( x, y, txt, style) {
    const el = document.createElementNS( svg.NS,"text");
    el.textContent = txt;
    el.setAttribute("x", x);
    el.setAttribute("y", y);
    if (style) el.style = style;  // el.setAttribute("style", style);
    return el;
  },
  createShape: function (shape, shapeAttributes, style, obj) {
    const el = document.createElementNS( svg.NS, shape);
    Object.keys( shapeAttributes).forEach( function (attrName) {
      var val;
      if (typeof shapeAttributes[attrName] === "function") {
        val = shapeAttributes[attrName](obj);
      } else val = shapeAttributes[attrName];
      el.setAttribute( attrName, val);
    })
    if (style) el.setAttribute("style", style);
    return el;
  },
  createShapeFromDefRec: function (shDefRec, obj) {
    var el = document.createElementNS( svg.NS, shDefRec.shapeName),
        shAttribs = shDefRec.shapeAttributes;
    Object.keys( shAttribs).forEach( function (attrName) {
      var val;
      if (typeof shAttribs[attrName] === "function") {
        val = shAttribs[attrName]( obj);
      } else val = shAttribs[attrName];
      switch (attrName) {
      case "textContent":
        el.textContent = val;
        break;
      case "file":
        el.setAttributeNS( svg.XLINK_NS, "href", val);
        break;
      default:
        el.setAttribute( attrName, val);
        break;
      }
    })
    if (shDefRec.style) el.setAttribute("style", shDefRec.style);
    return el;
  },
  createImageFillPattern: function (id, file, optParams) {
    var patEl = document.createElementNS( svg.NS,"pattern"),
        imgEl = document.createElementNS( svg.NS,"image");
    if (!optParams) optParams = {};
    imgEl.setAttributeNS( svg.XLINK_NS, "href", file);
    imgEl.setAttribute("width", optParams.width || 20);
    imgEl.setAttribute("height", optParams.height || 20);
    patEl.appendChild( imgEl);
    patEl.id = id;
    patEl.setAttribute("patternUnits", "userSpaceOnUse");
    patEl.setAttribute("width", optParams.width || 20);
    patEl.setAttribute("height", optParams.height || 20);
    if (optParams.x) patEl.setAttribute("x", optParams.x);
    if (optParams.y) patEl.setAttribute("y", optParams.y);
    return patEl;
  }
};

