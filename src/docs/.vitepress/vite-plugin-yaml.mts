import yaml from "js-yaml";

export default function yamlPlugin() {
  return {
    name: "yaml-loader",
    transform(src, id) {
      if (id.endsWith(".yml") || id.endsWith(".yaml")) {
        const json = JSON.stringify(yaml.load(src));
        return {
          code: `export default ${json}`,
          map: null,
        };
      }
    },
  };
}
