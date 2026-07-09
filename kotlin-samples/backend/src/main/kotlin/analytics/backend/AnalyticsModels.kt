package analytics.backend

import kotlinx.serialization.Serializable

@Serializable
data class PlatformMetrics(
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
data class AnalyticsResponse(
    val success: Boolean = true,
    val data: PlatformMetrics
)
