package expo.modules.widget

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WidgetModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("Widget")
  }
}