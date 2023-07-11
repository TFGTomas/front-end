(() => {
var exports = {};
exports.id = 888;
exports.ids = [888];
exports.modules = {

/***/ 3844:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* reexport safe */ private_next_pages_app_tsx__WEBPACK_IMPORTED_MODULE_0__.Z)
/* harmony export */ });
/* harmony import */ var private_next_pages_app_tsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4178);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([private_next_pages_app_tsx__WEBPACK_IMPORTED_MODULE_0__]);
private_next_pages_app_tsx__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];

        // Next.js Route Loader
        
        
    
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 4178:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ App)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6764);
/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var wagmi__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8998);
/* harmony import */ var wagmi_chains__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7697);
/* harmony import */ var wagmi_providers_public__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(8577);
/* harmony import */ var wagmi_connectors_walletConnect__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(6601);
/* harmony import */ var wagmi_connectors_coinbaseWallet__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(3225);
/* harmony import */ var wagmi_connectors_metaMask__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(5350);
/* harmony import */ var wagmi_connectors_ledger__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(3511);
/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(968);
/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_9__);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([wagmi__WEBPACK_IMPORTED_MODULE_2__, wagmi_chains__WEBPACK_IMPORTED_MODULE_3__, wagmi_providers_public__WEBPACK_IMPORTED_MODULE_4__, wagmi_connectors_walletConnect__WEBPACK_IMPORTED_MODULE_5__, wagmi_connectors_coinbaseWallet__WEBPACK_IMPORTED_MODULE_6__, wagmi_connectors_metaMask__WEBPACK_IMPORTED_MODULE_7__, wagmi_connectors_ledger__WEBPACK_IMPORTED_MODULE_8__]);
([wagmi__WEBPACK_IMPORTED_MODULE_2__, wagmi_chains__WEBPACK_IMPORTED_MODULE_3__, wagmi_providers_public__WEBPACK_IMPORTED_MODULE_4__, wagmi_connectors_walletConnect__WEBPACK_IMPORTED_MODULE_5__, wagmi_connectors_coinbaseWallet__WEBPACK_IMPORTED_MODULE_6__, wagmi_connectors_metaMask__WEBPACK_IMPORTED_MODULE_7__, wagmi_connectors_ledger__WEBPACK_IMPORTED_MODULE_8__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);











const walletConnectProjectId = "247042195e43824dd19a42a43c7e79e0";
const { chains , publicClient , webSocketPublicClient  } = (0,wagmi__WEBPACK_IMPORTED_MODULE_2__.configureChains)([
    wagmi_chains__WEBPACK_IMPORTED_MODULE_3__.mainnet,
    wagmi_chains__WEBPACK_IMPORTED_MODULE_3__.bsc,
    wagmi_chains__WEBPACK_IMPORTED_MODULE_3__.polygon,
    wagmi_chains__WEBPACK_IMPORTED_MODULE_3__.avalanche,
    wagmi_chains__WEBPACK_IMPORTED_MODULE_3__.goerli,
    wagmi_chains__WEBPACK_IMPORTED_MODULE_3__.polygonMumbai
], [
    (0,wagmi_providers_public__WEBPACK_IMPORTED_MODULE_4__.publicProvider)()
]);
const config = (0,wagmi__WEBPACK_IMPORTED_MODULE_2__.createConfig)({
    autoConnect: false,
    connectors: [
        new wagmi_connectors_metaMask__WEBPACK_IMPORTED_MODULE_7__.MetaMaskConnector({
            chains,
            options: {
                shimDisconnect: true,
                UNSTABLE_shimOnConnectSelectAccount: true
            }
        }),
        new wagmi_connectors_coinbaseWallet__WEBPACK_IMPORTED_MODULE_6__.CoinbaseWalletConnector({
            chains,
            options: {
                appName: "wagmi"
            }
        }),
        new wagmi_connectors_walletConnect__WEBPACK_IMPORTED_MODULE_5__.WalletConnectConnector({
            chains,
            options: {
                projectId: walletConnectProjectId
            }
        }),
        new wagmi_connectors_ledger__WEBPACK_IMPORTED_MODULE_8__.LedgerConnector({
            chains
        })
    ],
    publicClient,
    webSocketPublicClient
});
function App({ Component , pageProps  }) {
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(wagmi__WEBPACK_IMPORTED_MODULE_2__.WagmiConfig, {
        config: config,
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Component, {
                ...pageProps
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)((next_head__WEBPACK_IMPORTED_MODULE_9___default()), {
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("title", {
                        children: "Pasarela de Pagos"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("meta", {
                        name: "description",
                        content: "Pasarela de Pagos"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("meta", {
                        name: "viewport",
                        content: "width=device-width, initial-scale=1"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("link", {
                        rel: "icon",
                        href: "/favicon.ico"
                    })
                ]
            })
        ]
    });
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Component, {
        ...pageProps
    });
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 6764:
/***/ (() => {



/***/ }),

/***/ 968:
/***/ ((module) => {

"use strict";
module.exports = require("next/head");

/***/ }),

/***/ 6689:
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ 8998:
/***/ ((module) => {

"use strict";
module.exports = import("wagmi");;

/***/ }),

/***/ 7697:
/***/ ((module) => {

"use strict";
module.exports = import("wagmi/chains");;

/***/ }),

/***/ 3225:
/***/ ((module) => {

"use strict";
module.exports = import("wagmi/connectors/coinbaseWallet");;

/***/ }),

/***/ 3511:
/***/ ((module) => {

"use strict";
module.exports = import("wagmi/connectors/ledger");;

/***/ }),

/***/ 5350:
/***/ ((module) => {

"use strict";
module.exports = import("wagmi/connectors/metaMask");;

/***/ }),

/***/ 6601:
/***/ ((module) => {

"use strict";
module.exports = import("wagmi/connectors/walletConnect");;

/***/ }),

/***/ 8577:
/***/ ((module) => {

"use strict";
module.exports = import("wagmi/providers/public");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [893], () => (__webpack_exec__(3844)));
module.exports = __webpack_exports__;

})();