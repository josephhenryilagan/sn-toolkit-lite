javascript: (function () {
    const script = document.createElement('script');
    const antiCache = '?time=' + new Date().getTime();
    script.src = 'https://cdn.jsdelivr.net/gh/josephhenryilagan/sn-toolkit@main/sn-toolkit.js' + antiCache;
    script.type = 'text/javascript';
    document.head.appendChild(script);
})();