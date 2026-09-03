package com.wise2.mecapture

import android.Manifest
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.VideoLibrary
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel

class MainActivity : ComponentActivity() {
    private val permissions = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        permissions.launch(arrayOf(Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO))
        setContent { MeCaptureApp() }
    }
}

@Composable
fun MeCaptureApp(vm: CaptureViewModel = viewModel()) {
    var tab by remember { mutableIntStateOf(0) }
    var selectedClip by remember { mutableStateOf<Clip?>(null) }
    val icons = listOf(Icons.Default.Videocam, Icons.Default.VideoLibrary, Icons.Default.AutoAwesome, Icons.Default.Person)

    MaterialTheme(colorScheme = darkColorScheme(background = WiseBlack, surface = WisePanel, primary = WiseGreen, secondary = WiseBlue)) {
        Scaffold(
            containerColor = WiseBlack,
            bottomBar = {
                NavigationBar(containerColor = WisePanel) {
                    MeCaptureUiContract.tabs.forEachIndexed { index, label ->
                        NavigationBarItem(
                            selected = tab == index,
                            onClick = { tab = index; selectedClip = null },
                            icon = { Icon(icons[index], contentDescription = label) },
                            label = { Text(label) }
                        )
                    }
                }
            }
        ) { padding ->
            Box(Modifier.padding(padding).fillMaxSize()) {
                when {
                    selectedClip != null -> ClipDetailScreen(selectedClip!!, vm, onBack = { selectedClip = null })
                    tab == 0 -> CaptureScreen(vm)
                    tab == 1 -> LibraryScreen(vm, onClip = { selectedClip = it })
                    tab == 2 -> AiStudioScreen(vm)
                    else -> ProfileScreen()
                }
            }
        }
    }
}
