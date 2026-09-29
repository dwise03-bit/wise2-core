package com.wise2.quest.ui.navigation

import androidx.compose.runtime.Composable
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.wise2.quest.ui.screens.diagnostics.DiagnosticsScreen
import com.wise2.quest.ui.screens.diagnostics.DiagnosticsViewModel
import com.wise2.quest.ui.screens.jobs.JobListScreen
import com.wise2.quest.ui.screens.jobs.JobListViewModel
import com.wise2.quest.ui.screens.login.LoginScreen
import com.wise2.quest.ui.screens.login.LoginViewModel
import com.wise2.quest.ui.screens.tools.LiveToolsScreen

/**
 * Navigation destinations
 */
object AppDestinations {
  const val LOGIN = "login"
  const val JOBS = "jobs"
  const val DIAGNOSTICS = "diagnostics/{workOrderId}"
  const val LIVE_TOOLS = "live_tools/{workOrderId}"

  fun diagnosticsDestination(workOrderId: String) = "diagnostics/$workOrderId"
  fun liveToolsDestination(workOrderId: String) = "live_tools/$workOrderId"
}

/**
 * Main app navigation graph
 * Handles routing between Login, Jobs, Diagnostics, and Live Tools screens
 */
@Composable
fun AppNavGraph(navController: NavHostController = rememberNavController()) {
  NavHost(
    navController = navController,
    startDestination = AppDestinations.LOGIN
  ) {
    // Login Screen
    composable(AppDestinations.LOGIN) {
      val viewModel: LoginViewModel = hiltViewModel()
      LoginScreen(
        viewModel = viewModel,
        onLoginSuccess = {
          navController.navigate(AppDestinations.JOBS) {
            popUpTo(AppDestinations.LOGIN) { inclusive = true }
          }
        }
      )
    }

    // Job List Screen
    composable(AppDestinations.JOBS) {
      val viewModel: JobListViewModel = hiltViewModel()
      JobListScreen(
        viewModel = viewModel,
        onJobSelected = { workOrderId ->
          navController.navigate(AppDestinations.diagnosticsDestination(workOrderId))
        },
        onLogout = {
          navController.navigate(AppDestinations.LOGIN) {
            popUpTo(AppDestinations.JOBS) { inclusive = true }
          }
        }
      )
    }

    // Diagnostics Screen
    composable(AppDestinations.DIAGNOSTICS) { backStackEntry ->
      val workOrderId = backStackEntry.arguments?.getString("workOrderId") ?: return@composable
      val viewModel: DiagnosticsViewModel = hiltViewModel()

      DiagnosticsScreen(
        workOrderId = workOrderId,
        viewModel = viewModel,
        onLiveToolsClick = {
          navController.navigate(AppDestinations.liveToolsDestination(workOrderId))
        },
        onBackClick = {
          navController.navigateUp()
        }
      )
    }

    // Live Tools Screen
    composable(AppDestinations.LIVE_TOOLS) { backStackEntry ->
      val workOrderId = backStackEntry.arguments?.getString("workOrderId") ?: return@composable

      LiveToolsScreen(
        workOrderId = workOrderId,
        onBackClick = {
          navController.navigateUp()
        }
      )
    }
  }
}
