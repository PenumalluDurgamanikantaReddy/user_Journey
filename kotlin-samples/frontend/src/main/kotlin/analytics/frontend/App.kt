package analytics.frontend

import kotlinx.browser.window
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.await
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import react.FC
import react.Props
import react.dom.html.ReactHTML.button
import react.dom.html.ReactHTML.div
import react.dom.html.ReactHTML.h1
import react.dom.html.ReactHTML.li
import react.dom.html.ReactHTML.ul
import react.useEffect
import react.useState

private val scope = MainScope()

@Serializable
private data class PlatformMetrics(
    val totalUsers: Long,
    val impressions: Long? = null,
    val courseJoins: Long? = null,
    val courseStarts: Long? = null,
    val assignedMentors: Long? = null,
    val comments: Long? = null,
    val dms: Long? = null,
    val followers: Long? = null,
    val sessions: Long? = null,
    val totalEvents: Long? = null,
    val courseCompletions: Long? = null,
    val avgCompletionRatePct: Double? = null,
    val avgRating: Double? = null,
    val totalChats: Long? = null
)

@Serializable
private data class AnalyticsResponse(
    val success: Boolean,
    val data: PlatformMetrics
)

private external interface MetricProps : Props {
    var apiPath: String
    var title: String
}

private val AnalyticsCard = FC<MetricProps> { props ->
    val (loading, setLoading) = useState(true)
    val (metrics, setMetrics) = useState<PlatformMetrics?>(null)
    val (error, setError) = useState<String?>(null)

    useEffect {
        scope.launch {
            try {
                val response = window.fetch(props.apiPath).await()
                val text = response.text().await()
                if (!response.ok) {
                    setError("Error ${response.status}: $text")
                } else {
                    val parsed = Json.decodeFromString<AnalyticsResponse>(text)
                    setMetrics(parsed.data)
                }
            } catch (e: Throwable) {
                setError(e.message ?: "Unknown error")
            } finally {
                setLoading(false)
            }
        }
    }

    div {
        h1 { +props.title }
        if (loading) {
            div { +"Loading..." }
        } else if (error != null) {
            div { +"Error: $error" }
        } else {
            ul {
                li { +"Users: ${metrics?.totalUsers ?: 0}" }
                metrics?.impressions?.let { li { +"Impressions: $it" } }
                metrics?.courseJoins?.let { li { +"Course Joins: $it" } }
                metrics?.courseStarts?.let { li { +"Course Starts: $it" } }
                metrics?.assignedMentors?.let { li { +"Assigned Mentors: $it" } }
                metrics?.comments?.let { li { +"Comments: $it" } }
                metrics?.dms?.let { li { +"DMs: $it" } }
                metrics?.followers?.let { li { +"Followers: $it" } }
                metrics?.sessions?.let { li { +"Sessions: $it" } }
                metrics?.totalEvents?.let { li { +"Total Events: $it" } }
                metrics?.courseCompletions?.let { li { +"Course Completions: $it" } }
                metrics?.avgCompletionRatePct?.let { li { +"Completion Rate: $it%" } }
                metrics?.avgRating?.let { li { +"Rating: $it" } }
                metrics?.totalChats?.let { li { +"Total Chats: $it" } }
            }
        }
    }
}

val App = FC<Props> {
    div {
        h1 { +"Analytics Dashboard Sample" }
        AnalyticsCard {
            apiPath = "/api/analytics/facebook"
            title = "Facebook Metrics"
        }
        AnalyticsCard {
            apiPath = "/api/analytics/instagram"
            title = "Instagram Metrics"
        }
        AnalyticsCard {
            apiPath = "/api/analytics/google-ads"
            title = "Google Ads Metrics"
        }
        AnalyticsCard {
            apiPath = "/api/analytics/youversion"
            title = "YouVersion Metrics"
        }
        AnalyticsCard {
            apiPath = "/api/analytics/website"
            title = "Website Metrics"
        }
        AnalyticsCard {
            apiPath = "/api/analytics/ai-chat"
            title = "AI Chat Metrics"
        }
    }
}
