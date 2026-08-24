package com.wise2.fieldtech.ui.navigation

import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.wise2.fieldtech.di.AppContainer
import com.wise2.fieldtech.ui.screens.diagnose.DiagnoseScreen
import com.wise2.fieldtech.ui.screens.diagnose.DiagnoseViewModel
import com.wise2.fieldtech.ui.screens.equipment.EquipmentScreen
import com.wise2.fieldtech.ui.screens.equipment.EquipmentViewModel
import com.wise2.fieldtech.ui.screens.home.HomeScreen
import com.wise2.fieldtech.ui.screens.home.HomeViewModel
import com.wise2.fieldtech.ui.screens.imp.ImpChatScreen
import com.wise2.fieldtech.ui.screens.imp.ImpChatViewModel
import com.wise2.fieldtech.ui.screens.jobdetail.JobDetailScreen
import com.wise2.fieldtech.ui.screens.jobdetail.JobDetailViewModel
import com.wise2.fieldtech.ui.screens.login.LoginScreen
import com.wise2.fieldtech.ui.screens.login.LoginViewModel
import com.wise2.fieldtech.ui.screens.readings.LiveReadingsScreen
import com.wise2.fieldtech.ui.screens.readings.LiveReadingsViewModel
import com.wise2.fieldtech.ui.screens.report.JobReportScreen
import com.wise2.fieldtech.ui.screens.report.JobReportViewModel
import com.wise2.fieldtech.ui.screens.settings.SettingsScreen
import com.wise2.fieldtech.ui.screens.settings.SettingsViewModel
import kotlinx.coroutines.launch

@Composable
fun WiseNavGraph(navController: NavHostController, container: AppContainer) {
    // Demo mode: always go to Home, skip login
    val startDestination = Destination.Home.route

    NavHost(navController = navController, startDestination = startDestination) {
        composable(Destination.Login.route) {
            val vm: LoginViewModel = viewModel(factory = viewModelFactory { initializer { LoginViewModel(container.authRepository) } })
            LoginScreen(vm) {
                navController.navigate(Destination.Home.route) { popUpTo(Destination.Login.route) { inclusive = true } }
            }
        }

        composable(Destination.Home.route) {
            val scope = androidx.compose.runtime.rememberCoroutineScope()
            val vm: HomeViewModel = viewModel(
                factory = viewModelFactory {
                    initializer {
                        HomeViewModel(container.jobRepository, container.userPreferences, container.connectivityObserver, container.database.pendingSyncDao())
                    }
                },
            )
            HomeScreen(
                viewModel = vm,
                onJobClick = { navController.navigate(Destination.JobDetail.path(it)) },
                onDiagnose = { navController.navigate(Destination.Diagnose.path(it)) },
                onLiveReadings = { navController.navigate(Destination.LiveReadings.path(it)) },
                onEquipment = { navController.navigate(Destination.Equipment.path(it)) },
                onImp = { navController.navigate(Destination.ImpChat.path(it)) },
                onNewJob = {
                    // Minimal creation flow: seed a job appointed "now" so it appears immediately;
                    // a full creation form is a natural next iteration once this ships.
                    scope.launch {
                        val job = container.jobRepository.createJob(
                            customerName = "New Customer",
                            customerPhone = "",
                            address = "",
                            appointmentAtEpochMillis = System.currentTimeMillis(),
                            complaint = "",
                        )
                        navController.navigate(Destination.JobDetail.path(job.id))
                    }
                },
                onSettings = { navController.navigate(Destination.Settings.route) },
            )
        }

        composable(
            Destination.JobDetail.route,
            arguments = listOf(navArgument(Destination.ARG_JOB_ID) { type = NavType.StringType }),
        ) { backStackEntry ->
            val jobId = backStackEntry.arguments?.getString(Destination.ARG_JOB_ID)!!
            val vm: JobDetailViewModel = viewModel(factory = viewModelFactory { initializer { JobDetailViewModel(container.jobRepository, jobId) } })
            JobDetailScreen(
                viewModel = vm,
                onBack = { navController.popBackStack() },
                onDiagnose = { navController.navigate(Destination.Diagnose.path(it)) },
                onLiveReadings = { navController.navigate(Destination.LiveReadings.path(it)) },
                onEquipment = { navController.navigate(Destination.Equipment.path(it)) },
                onImp = { navController.navigate(Destination.ImpChat.path(it)) },
                onReport = { navController.navigate(Destination.JobReport.path(it)) },
            )
        }

        composable(
            Destination.LiveReadings.route,
            arguments = listOf(navArgument(Destination.ARG_JOB_ID) { type = NavType.StringType }),
        ) { backStackEntry ->
            val jobId = backStackEntry.arguments?.getString(Destination.ARG_JOB_ID)!!
            val vm: LiveReadingsViewModel = viewModel(
                factory = viewModelFactory { initializer { LiveReadingsViewModel(container.toolManager, container.readingRepository, jobId) } },
            )
            LiveReadingsScreen(vm) { navController.popBackStack() }
        }

        composable(
            Destination.Diagnose.route,
            arguments = listOf(navArgument(Destination.ARG_JOB_ID) { type = NavType.StringType }),
        ) { backStackEntry ->
            val jobId = backStackEntry.arguments?.getString(Destination.ARG_JOB_ID)!!
            val vm: DiagnoseViewModel = viewModel(factory = viewModelFactory { initializer { DiagnoseViewModel(container.diagnosticRepository, jobId) } })
            DiagnoseScreen(vm, onBack = { navController.popBackStack() }, onFinished = { navController.navigate(Destination.JobReport.path(jobId)) })
        }

        composable(
            Destination.ImpChat.route,
            arguments = listOf(navArgument(Destination.ARG_JOB_ID) { type = NavType.StringType }),
        ) { backStackEntry ->
            val jobId = backStackEntry.arguments?.getString(Destination.ARG_JOB_ID)!!
            val vm: ImpChatViewModel = viewModel(
                factory = viewModelFactory {
                    initializer {
                        ImpChatViewModel(
                            container.impRepository, container.jobRepository, container.equipmentRepository,
                            container.readingRepository, container.diagnosticRepository, jobId,
                        )
                    }
                },
            )
            ImpChatScreen(vm) { navController.popBackStack() }
        }

        composable(
            Destination.JobReport.route,
            arguments = listOf(navArgument(Destination.ARG_JOB_ID) { type = NavType.StringType }),
        ) { backStackEntry ->
            val jobId = backStackEntry.arguments?.getString(Destination.ARG_JOB_ID)!!
            val vm: JobReportViewModel = viewModel(
                factory = viewModelFactory {
                    initializer { JobReportViewModel(container.reportRepository, container.jobRepository, container.diagnosticRepository, jobId) }
                },
            )
            JobReportScreen(vm) { navController.popBackStack() }
        }

        composable(
            Destination.Equipment.route,
            arguments = listOf(navArgument(Destination.ARG_EQUIPMENT_ID) { type = NavType.StringType }),
        ) { backStackEntry ->
            val equipmentId = backStackEntry.arguments?.getString(Destination.ARG_EQUIPMENT_ID)!!
            val vm: EquipmentViewModel = viewModel(factory = viewModelFactory { initializer { EquipmentViewModel(container.equipmentRepository, equipmentId) } })
            EquipmentScreen(vm) { navController.popBackStack() }
        }

        composable(Destination.Settings.route) {
            val vm: SettingsViewModel = viewModel(
                factory = viewModelFactory { initializer { SettingsViewModel(container.userPreferences, container.authRepository, container.updateRepository) } },
            )
            SettingsScreen(
                viewModel = vm,
                onBack = { navController.popBackStack() },
                onLoggedOut = { navController.navigate(Destination.Login.route) { popUpTo(0) { inclusive = true } } },
            )
        }
    }
}
