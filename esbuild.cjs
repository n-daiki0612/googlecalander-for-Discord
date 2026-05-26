const esbuild = require('esbuild');
const { GasPlugin } = require('esbuild-gas-plugin');


esbuild
    .build({
        entryPoints: ["./src/main.ts"],
        bundle: true,
        minify: true,
        target:"es2019",
        outfile: "./dist/main.js",
        plugins: [GasPlugin,
        ],
    })
    .catch((error) => {
        console.log('ビルドに失敗しました')
        console.error(error);
        process.exit(1);
    });
