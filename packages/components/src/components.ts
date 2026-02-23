import type { App, Component } from "vue";

export interface ComponentModule {
  name: string;
  component: Component;
}

export interface ComponentCategory {
  id: string;
  name: string;
  icon: string;
  components: ComponentModule[];
}

export const version = "1.0.0";

export function install(app: App): void {
  // Install components
}

export default {
  install,
  version,
};
