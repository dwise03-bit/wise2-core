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
import com.wise2.fieldtech.ui.screens.home.CustomersScreen
import com.wise2.fieldtech.ui.screens.home.HomeScreen
import com.wise2.fieldtech.ui.screens.home.HomeViewModel
import com.wise2.fieldtech.ui.screens.home.JobsScreen
import com.wise2.fieldtech.ui.screens.imp.ImpChatScreen
import com.wise2.fieldtech.ui.screens.imp.ImpChatViewModel
import com.wise2.fieldtech.ui.screens.jobdetail.JobDetailScreen
import com.wise2.fieldtech.ui.screens.jobdetail.JobDetailViewModel
import com.wise2.fieldtech.ui.screens.login.LoginScreen
import com.wise2.fieldtech.ui.screens.login.LoginViewModel
import com.wise2.fieldtech.ui.screens.newjob.NewJobScreen
import com.wise2.fieldtech.ui.screens.newjob.NewJobViewModel
import com.wise2.fieldtech.ui.screens.readings.LiveReadingsScreen
import com.wise2.fieldtech.ui.screens.readings.LiveReadingsViewModel
import com.wise2.fieldtech.ui.screens.report.JobReportScreen
import com.wise2.fieldtech.ui.screens.report.JobReportViewModel
import com.wise2.fieldtech.ui.screens.settings.SettingsScreen
import com.wise2.fieldtech.ui.screens.settings.SettingsViewModel

@Composable
fun WiseNavGraph(navController: NavHostController, container: AppContainer) {
    val startDestination = Destination.Home.route
    fun homeVmFactory() = viewModelFactory {
        initializer { HomeViewModel(container.jobRepository, container.userPreferences, container.connectivityObserver, container.database.pendingSyncDao()) }
    }

    NavHost(navController = navController, startDestination = startDestination) {
        composable(Destination.Login.route) {
            val vm: LoginViewModel = viewModel(factory = viewModelFactory { initializer { LoginViewModel(container.authRepository) } })
            LoginScreen(vm) { navController.navigate(Destination.Home.route) { popUpTo(Destination.Login.route) { inclusive = true } } }
        }

        composable(Destination.Home.route) {
            val vm: HomeViewModel = viewModel(factory = homeVmFactory())
            HomeScreen(
                viewModel = vm,
                onJobClick = { navController.navigate(Destination.JobDetail.path(it)) },
                onDiagnose = { navController.navigate(Destination.Diagnose.path(it)) },
                onLiveReadings = { navController.navigate(Destination.LiveReadings.path(it)) },
                onEquipment = { navController.navigate(Destination.Equipment.path(it)) },
                onImp = { navController.navigate(Destination.ImpChat.path(it)) },
                onReport = { navController.navigate(Destination.JobReport.path(it)) },
                onNewJob = { navController.navigate(Destination.NewJob.route) },
                onJobs = { navController.navigate(Destination.Jobs.route) },
                onCustomers = { navController.navigate(Destination.Customers.route) },
                onSettings = { navController.navigate(Destination.Settings.route) },
            )
        }

        composable(Destination.NewJob.route) {
            val vm: NewJobViewModel = viewModel(factory = viewModelFactory { initializer { NewJobViewModel(container.jobRepository) } })
            NewJobScreen(
                viewModel = vm,
                onBack = { navController.popBackStack() },
                onCreated = { jobId ->
                    navController.navigate(Destination.JobDetail.path(jobId)) {
                        popUpTo(Destination.NewJob.route) { inclusive = true }
                    }
                },
            )
        }

        composable(Destination.Jobs.route) {
            val vm: HomeViewModel = viewModel(factory = homeVmFactory())
            JobsScreen(vm, onBack = { navController.popBackStack() }, onJobClick = { navController.navigate(Destination.JobDetail.path(it)) })
        }

        composable(Destination.Customers.route) {
            val vm: HomeViewModel = viewModel(factory = homeVmFactory())
            CustomersScreen(vm, onBack = { navController.popBackStack() }, onJobClick = { navController.navigate(Destination.JobDetail.path(it)) })
        }

        composable(Destination.JobDetail.route, arguments = listOf(navArgument(Destination.ARG_JOB_ID) { type = NavType.StringType })) { backStackEntry ->
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

        composable(Destination.LiveReadings.route, arguments = listOf(navArgument(Destination.ARG_JOB_ID) { type = NavType.StringType })) { backStackEntry ->
            val jobId = backStackEntry.arguments?.getString(Destination.ARG_JOB_ID)!!
            val vm: LiveReadingsViewModel = viewModel(factory = viewModelFactory { initializer { LiveReadingsViewModel(container.toolManager, container.readingRepository, jobId) } })
            LiveReadingsScreen(vm, onBack = { navController.popBackStack() }, onRunDiagnostic = { navController.navigate(Destination.Diagnose.path(jobId)) })
        }

        composable(Destination.Diagnose.route, arguments = listOf(navArgument(Destination.ARG_JOB_ID) { type = NavType.StringType })) { backStackEntry ->
            val jobId = backStackEntry.arguments?.getString(Destination.ARG_JOB_ID)!!
            val vm: DiagnoseViewModel = viewModel(factory = viewModelFactory { initializer { DiagnoseViewModel(container.diagnosticRepository, jobId) } })
            DiagnoseScreen(vm, onBack = { navController.popBackStack() }, onFinished = { navController.navigate(Destination.JobReport.path(jobId)) })
        }

        composable(Destination.ImpChat.route, arguments = listOf(navArgument(Destination.ARG_JOB_ID) { type = NavType.StringType })) { backStackEntry ->
            val jobId = backStackEntry.arguments?.getString(Destination.ARG_JOB_ID)!!
            val vm: ImpChatViewModel = viewModel(factory = viewModelFactory {
                initializer { ImpChatViewModel(container.impRepository, container.jobRepository, container.equipmentRepository, container.readingRepository, container.diagnosticRepository, jobId) }
            })
            ImpChatScreen(vm) { navController.popBackStack() }
        }

        composable(Destination.JobReport.route, arguments = listOf(navArgument(Destination.ARG_JOB_ID) { type = NavType.StringType })) { backStackEntry ->
            val jobId = backStackEntry.arguments?.getString(Destination.ARG_JOB_ID)!!
            val vm: JobReportViewModel = viewModel(factory = viewModelFactory {
                initializer { JobReportViewModel(container.reportRepository, container.jobRepository, container.diagnosticRepository, jobId) }
            })
            JobReportScreen(vm) { navController.popBackStack() }
        }

        composable(Destination.Equipment.route, arguments = listOf(navArgument(Destination.ARG_EQUIPMENT_ID) { type = NavType.StringType })) { backStackEntry ->
            val equipmentId = backStackEntry.arguments?.getString(Destination.ARG_EQUIPMENT_ID)!!
            val vm: EquipmentViewModel = viewModel(factory = viewModelFactory { initializer { EquipmentViewModel(container.equipmentRepository, equipmentId) } })
            EquipmentScreen(vm) { navController.popBackStack() }
        }

        composable(Destination.Settings.route) {
            val vm: SettingsViewModel = viewModel(factory = viewModelFactory { initializer { SettingsViewModel(container.userPreferences, container.authRepository, container.updateRepository) } })
            SettingsScreen(
                viewModel = vm,
                onBack = { navController.popBackStack() },
                onLoggedOut = { navController.navigate(Destination.Login.route) { popUpTo(0) { inclusive = true } } },
            )
        }
    }
}
