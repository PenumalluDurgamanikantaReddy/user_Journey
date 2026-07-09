package analytics.backend

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.serialization.kotlinx.json.*

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0") {
        install(ContentNegotiation) {
            json()
        }

        install(CORS) {
            anyHost()
            allowHeader("Content-Type")
            allowHeader("Accept")
            allowMethod(io.ktor.http.HttpMethod.Get)
            allowMethod(io.ktor.http.HttpMethod.Options)
        }

        routing {
            get("/api/analytics/facebook") {
                call.respond(
                    AnalyticsResponse(
                        data = PlatformMetrics(
                            totalUsers = 1_280_000,
                            courseJoins = 12500,
                            comments = 54000,
                            dms = 18000
                        )
                    )
                )
            }

            get("/api/analytics/instagram") {
                call.respond(
                    AnalyticsResponse(
                        data = PlatformMetrics(
                            totalUsers = 760_000,
                            courseJoins = 8200,
                            comments = 43000,
                            dms = 9800,
                            followers = 190000
                        )
                    )
                )
            }

            get("/api/analytics/google-ads") {
                call.respond(
                    AnalyticsResponse(
                        data = PlatformMetrics(
                            totalUsers = 210_000,
                            impressions = 5_200_000,
                            courseJoins = 7800,
                            courseStarts = 13200,
                            assignedMentors = 1800
                        )
                    )
                )
            }

            get("/api/analytics/youversion") {
                call.respond(
                    AnalyticsResponse(
                        data = PlatformMetrics(
                            totalUsers = 3_100_000,
                            courseCompletions = 985000,
                            avgCompletionRatePct = 76.4,
                            avgRating = 4.7
                        )
                    )
                )
            }

            get("/api/analytics/website") {
                call.respond(
                    AnalyticsResponse(
                        data = PlatformMetrics(
                            totalUsers = 620_000,
                            sessions = 864_000,
                            courseJoins = 4200,
                            totalEvents = 148000
                        )
                    )
                )
            }

            get("/api/analytics/ai-chat") {
                call.respond(
                    AnalyticsResponse(
                        data = PlatformMetrics(
                            totalChats = 230000,
                            dms = 230000,
                            courseJoins = 7600
                        )
                    )
                )
            }
        }
    }.start(wait = true)
}
