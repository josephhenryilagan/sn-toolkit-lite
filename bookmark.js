javascript: (function () {
    const script = document.createElement('script');
    const antiCache = '?time=' + new Date().getTime();
    script.src = 'https://cdn.jsdelivr.net/gh/josephhenryilagan/servicenow-toolkit-lite@main/ServiceNow%20Toolkit.js' + antiCache;
    script.type = 'text/javascript';
    document.head.appendChild(script);
})();