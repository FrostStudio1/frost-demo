module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/app/payroll/ExportCSV.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/payroll/ExportCSV.tsx
__turbopack_context__.s([
    "default",
    ()=>ExportCSV
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
'use client';
;
function ExportCSV({ rows, fileName = 'payroll.csv' }) {
    function toCSV(data) {
        if (!data || data.length === 0) return '';
        const cols = Object.keys(data[0]);
        const esc = (v)=>{
            const s = String(v ?? '');
            if (s.includes('"') || s.includes(';') || s.includes('\n')) {
                return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
        };
        const head = cols.join(';');
        const body = data.map((r)=>cols.map((c)=>esc(r[c])).join(';')).join('\n');
        return head + '\n' + body;
    }
    const handleDownload = ()=>{
        const csv = toCSV(rows);
        const blob = new Blob([
            csv
        ], {
            type: 'text/csv;charset=utf-8;'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: handleDownload,
        className: "px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50",
        children: "Exportera CSV"
    }, void 0, false, {
        fileName: "[project]/app/payroll/ExportCSV.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4bfb6680._.js.map