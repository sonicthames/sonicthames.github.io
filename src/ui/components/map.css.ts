/**
 * Drawer and panel styles using composable recipes.
 * All values now match original Tailwind exactly via token corrections.
 */
import { drawerContainer, panelRecipe } from "@theme/recipes/layout.css"

// Re-export with legacy names for backward compatibility
export const drawer = drawerContainer
export const drawerPanel = panelRecipe({ kind: "drawer" })
