const ExtractTextPlugin = require("extract-text-webpack-plugin");

const baseConfig = require("./webpack.base.config");

const path = require("path");

const proxyRoutes = [
  {
    label: "/metagenomics/studies",
    regex: "^/metagenomics/studies/.*$",
    page: "/metagenomics/study.html",
  },
  {
    label: "/metagenomics/super-studies",
    regex: "^/metagenomics/super-studies/.*$",
    page: "/metagenomics/superstudy.html",
  },
  {
    label: "/metagenomics/samples",
    regex: "^/metagenomics/samples/.*$",
    page: "/metagenomics/sample.html",
  },
  {
    label: "/metagenomics/runs",
    regex: "^/metagenomics/runs/.*$",
    page: "/metagenomics/run.html",
  },
  {
    label: "/metagenomics/analyses",
    regex: "^/metagenomics/analyses/.*$",
    page: "/metagenomics/analysis.html",
  },
  {
    label: "/metagenomics/assemblies",
    regex: "^/metagenomics/assemblies/.*$",
    page: "/metagenomics/assembly.html",
  },
  {
    label: "/metagenomics/pipelines",
    regex: "^/metagenomics/pipelines/.*$",
    page: "/metagenomics/pipeline.html",
  },
  {
    label: "/metagenomics/publications",
    regex: "^/metagenomics/publications/.*$",
    page: "/metagenomics/publication.html",
  },
  {
    label: "/metagenomics/contigs",
    regex: "^/metagenomics/contigs/.*$",
    page: "/metagenomics/contigs.html",
  },
  {
    label: "/metagenomics/genomes",
    regex: "^/metagenomics/genomes/.+$",
    page: "/metagenomics/genome.html",
  },
  // {
  //   label: "/metagenomics/genomes",
  //   regex: "^/metagenomics/genomes/?$",
  //   page: "/metagenomics/genomes.html",
  // },
  {
    label: "/metagenomics/genome-catalogues",
    regex: "^/metagenomics/genome-catalogues/.*$",
    page: "/metagenomics/genome-catalogue.html",
  },
  "/metagenomics/genome-search",
  "/metagenomics/healthcheck",
  "/metagenomics/browse",
  "/metagenomics/about",
  "/metagenomics/help",
  "/metagenomics/biomes",
  "/metagenomics/compare",
  "/metagenomics/submit",
  "/metagenomics/search",
  "/metagenomics/sequenceSearch",
  "/metagenomics/pipelines",
  "/metagenomics/mydata",
];

const getProxyRoutes = () => {
  const routes = {
    "/metagenomics/api": {
      target: "http://localhost:8000/",
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        "^/metagenomics/api/latest": "/v1",
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "X-Requested-With, content-type, Authorization",
      },
    },
    "/http-auth/login": {
      //tryign to redirect connctions to the API
      target: "http://localhost:8000/",
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        "^/http-auth/login": "/http-auth/login/",
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "X-Requested-With, content-type, Authorization",
      },
    },
    "/ebisearch/ws/rest": {
      target: "http://www.ebi.ac.uk/",
      secure: false,
      changeOrigin: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type",
      },
    },
  };
  proxyRoutes.forEach((route) => {
    const label = typeof route === "string" ? route : route.label;
    const regex = typeof route === "string" ? `^${route}` : route.regex;
    const page = typeof route === "string" ? `${route}.html` : route.page;
    routes[label] = {
      target: "http://localhost:9000/",
      pathRewrite: {
        [regex]: page,
      },
    };
  });
  routes["/metagenomics/genome"] = {
    target: "http://localhost:9000/",
    pathRewrite: {
      "^/metagenomics/genomes/.+$": "/metagenomics/genome.html",
      "^/metagenomics/genomes/?$": "/metagenomics/genomes.html",
      "^/metagenomics/genome-search": "/metagenomics/genome-search.html",
    },
  };
  return routes;
};

module.exports = {
  mode: "development",
  plugins: baseConfig.plugins, // filter out empty values
  entry: baseConfig.entry,
  output: baseConfig.output,
  resolve: baseConfig.resolve,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "istanbul-instrumenter-loader",
          query: { esModules: true },
        },
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            {
              loader: "css-loader",
              options: { minimize: true, sourceMap: true },
            },
          ],
        }),
      },
    ].concat(baseConfig.module.rules),
  },
  optimization: {
    splitChunks: {
      chunks: "async",
      minSize: 1000,
      minChunks: 3,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
    },
    noEmitOnErrors: true, // NoEmitOnErrorsPlugin
    concatenateModules: true, // ModuleConcatenationPlugin
  },
  devtool: "#inline-source-map",
  node: baseConfig.node,
  watchOptions: {
    ignored: /node_modules/,
  },
  devServer: {
    port: 9000,
    proxy: getProxyRoutes(),
    contentBase: path.join(__dirname, "static"),
  },
};
