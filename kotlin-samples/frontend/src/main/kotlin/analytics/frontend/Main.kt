package analytics.frontend

import react.createElement
import react.dom.client.createRoot
import web.dom.document

fun main() {
    val container = document.getElementById("root") ?: error("Could not find root element")
    createRoot(container).render(createElement(App))
}
