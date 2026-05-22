const esbuild = require('esbuild');
const { GasPlugin } = require('esbuild-gas-plugin');
const { NodeModulesPolyfillPlugin } = require('@esbuild-plugins/node-modules-polyfill');

esbuild
    .build({
        entryPoints: ["./src/main.ts"],
        bundle: true,
        minify: true,
        outfile: "./dist/main.js",
        plugins: [GasPlugin,
            NOdeMOdulesPollyfillPlugin(),
        ],
    })
    .catch((error) => {
        console.log('ビルドに失敗しました')
        console.error(error);
        process.exit(1);
    });
