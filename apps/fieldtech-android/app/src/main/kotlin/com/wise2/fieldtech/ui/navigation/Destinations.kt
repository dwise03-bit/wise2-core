package com.wise2.fieldtech.ui.navigation

sealed class Destination(val route: String) {
    data object Login : Destination("login")
    data object Home : Destination("home")
    data object Settings : Destination("settings")

    data object JobDetail : Destination("jobs/{jobId}") {
        fun path(jobId: String) = "jobs/$jobId"
    }
    data object LiveReadings : Destination("jobs/{jobId}/readings") {
        fun path(jobId: String) = "jobs/$jobId/readings"
    }
    data object Diagnose : Destination("jobs/{jobId}/diagnose") {
        fun path(jobId: String) = "jobs/$jobId/diagnose"
    }
    data object ImpChat : Destination("jobs/{jobId}/imp") {
        fun path(jobId: String) = "jobs/$jobId/imp"
    }
    data object JobReport : Destination("jobs/{jobId}/report") {
        fun path(jobId: String) = "jobs/$jobId/report"
    }
    data object Equipment : Destination("equipment/{equipmentId}") {
        fun path(equipmentId: String) = "equipment/$equipmentId"
    }

    companion object {
        const val ARG_JOB_ID = "jobId"
        const val ARG_EQUIPMENT_ID = "equipmentId"
    }
}
