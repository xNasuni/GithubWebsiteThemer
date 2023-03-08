// ==UserScript==
// @name Github Website Themer
// @namespace Mia's Utility Scripts
// @version 1
// @updateURL https://github.com/xNasuni/GithubWebsiteThemer/raw/main/githubwebsitethemer.user.js
// @downloadURL https://github.com/xNasuni/GithubWebsiteThemer/raw/main/githubwebsitethemer.user.js
// @author Mia
// @description Changes the main colors of the GitHub website, like all of the blue.
// @include *github.com/*
// @grant none
// ==/UserScript==

// put in your own color below! me personally i like pink c:
var MainColor = '#ff80bf' // hex color (make sure it starts with a #)

class StyleSheetController {
    constructor(CSSText) {
        this.StyleElement = document.createElement('style')
        this.StyleElement.type = 'text/css'
        this.StyleElement.appendChild(document.createTextNode(CSSText))
        this.OldInner = this.StyleElement.innerHTML
        this.ChangedRoots = {}
        this.OriginalRoots = {}
        this.Enabled = true
        document.head.appendChild(this.StyleElement)
    }

    get StartingComment() {
        return decodeURIComponent(`<!--`)
    }

    get EndingComment() {
        return decodeURIComponent(`-->`)
    }

    ToggleOn() {
        this.Enabled = true
        this.StyleElement.innerText = this.OldInner
        for (var ChangedRoot in this.ChangedRoots) {
            RootElement.style.setProperty(ChangedRoot, this.ChangedRoots[ChangedRoot])
        }
    }

    ToggleOff() {
        this.Enabled = false
        this.OldInner = this.StyleElement.innerText
        this.StyleElement.innerText = ''
        for (var OriginalRoot in this.OriginalRoots) {
            RootElement.style.setProperty(OriginalRoot, this.OriginalRoots[OriginalRoot])
        }
    }

    Insert(CSSRules) {
        this.StyleElement.innerText += CSSRules
        this.OldInner = this.StyleElement.innerText
    }

    SetRoot(Key, Value) {
        this.OriginalRoots[Key] = getComputedStyle(RootElement).getPropertyValue(Key)
        this.ChangedRoots[Key] = Value
        if (this.Enabled) {
            RootElement.style.setProperty(Key, Value)
        }
    }
}

// paste start (stolen from internet)

function HSLToRGB(H, S, L) {
    var r, g, b;

    if (S == 0) {
        r = g = b = L; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = L < 0.5 ? L * (1 + S) : L + S - L * S;
        var p = 2 * L - q;
        r = hue2rgb(p, q, H + 1 / 3);
        g = hue2rgb(p, q, H);
        b = hue2rgb(p, q, H - 1 / 3);
    }

    return { R: Math.round(r * 255), G: Math.round(g * 255), B: Math.round(b * 255) };
}

function RGBToHSL(R, G, B) {
    R /= 255, G /= 255, B /= 255;
    var max = Math.max(R, G, B), min = Math.min(R, G, B);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case R: h = (G - B) / d + (G < B ? 6 : 0); break;
            case G: h = (B - R) / d + 2; break;
            case B: h = (R - G) / d + 4; break;
        }
        h /= 6;
    }

    return { H: h, S: s, L: l };
}

function RGBToHex(R, G, B) {
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    return "#" + componentToHex(R) + componentToHex(G) + componentToHex(B);
}

function HexToRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        R: parseInt(result[1], 16),
        G: parseInt(result[2], 16),
        B: parseInt(result[3], 16)
    } : null;
}

function LightenDarkenColor(col,amt) {
    amt *= 40;
    var usePound = false;
    if ( col[0] == "#" ) {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col,16);

    var r = (num >> 16) + amt;

    if ( r > 255 ) r = 255;
    else if  (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if ( b > 255 ) b = 255;
    else if  (b < 0) b = 0;
    
    var g = (num & 0x0000FF) + amt;

    if ( g > 255 ) g = 255;
    else if  ( g < 0 ) g = 0;

    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

// paste end (stolen from internet)

function RGBToHexString(RGB) {
    return RGBToHex(RGB.R, RGB.G, RGB.B)
}

function Darkify(R, G, B, T, F = 4) {
    var HSL = RGBToHSL(R, G, B)
    HSL.L -= 1 / F * (T - 1)
    var RGB = HSLToRGB(HSL.H, HSL.S, HSL.L)
    return { R: RGB.R, G: RGB.G, B: RGB.B }
}

function Lightify(R, G, B, T, F = 4) {
    var HSL = RGBToHSL(R, G, B)
    HSL.L += 1 / F * (T - 1)
    var RGB = HSLToRGB(HSL.H, HSL.S, HSL.L)
    return { R: RGB.R, G: RGB.G, B: RGB.B }
}

var ThisStyle;
var RootElement = document.documentElement

function ApplyCSS(StyleSheet) {
    if (ThisStyle == undefined) {
        ThisStyle = new StyleSheetController(StyleSheet)
    } else {
        ThisStyle.Insert(StyleSheet)
    }
}

function AddRoots(Roots) {
    if (ThisStyle == undefined) {
        ThisStyle = new StyleSheetController()
    }
    for (Root in Roots) {
        ThisStyle.SetRoot(Root, Roots[Root])
    }
}

var RGB = HexToRGB(MainColor)

var ColoredProperties = {
    '--color-accent-fg': MainColor,
    '--color-btn-primary-bg': MainColor,
    '--color-btn-outline-text': MainColor,
    '--color-btn-primary-hover-bg': LightenDarkenColor(MainColor, 2),
    '--color-success-fg': MainColor,
    '--color-success-emphasis': MainColor,
    '--color-done-fg': MainColor,
    '--color-severe-fg': MainColor,
    '--color-danger-fg': MainColor,
    '--color-danger-subtle': MainColor + '11',
    '--color-attention-fg': MainColor,
    '--color-primer-border-active': MainColor,
    '--color-accent-muted': MainColor,
    '--color-accent-emphasis': MainColor,
    '--color-accent-subtle': MainColor + '55', // <-- + '55' for Transparency
    '--color-calendar-graph-day-L1-bg': LightenDarkenColor(MainColor, -3),
    '--color-calendar-graph-day-L2-bg': LightenDarkenColor(MainColor, -2),
    '--color-calendar-graph-day-L3-bg': LightenDarkenColor(MainColor, -1),
    '--color-calendar-graph-day-L4-bg': MainColor,
    '--color-scale-yellow-2': MainColor,
    '--color-open-emphasis': MainColor,
    '--color-btn-primary-disabled-bg': MainColor + '99',
    '--color-danger-muted': MainColor + '99'
}

AddRoots(ColoredProperties)

ApplyCSS(`
.unread-indicator {
    background-image: linear-gradient(${MainColor}, ${MainColor}) !important;
}

.cls-1 {
    fill: #fff !important;
}

.cls-2 {
    fill: ${MainColor} !important;
}

.Progress-item {
    background-color: ${MainColor} !important;
}

.CircleBadge {
    background-color: ${MainColor} !important;
}

.subnav-primary.selected {
    border-bottom-color: ${MainColor} !important;
}
`)
