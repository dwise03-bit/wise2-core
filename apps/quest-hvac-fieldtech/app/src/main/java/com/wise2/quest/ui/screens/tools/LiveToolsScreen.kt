package com.wise2.quest.ui.screens.tools

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wise2.quest.R

/**
 * Live tools screen with passthrough camera overlay and tool stream
 */
@Composable
fun LiveToolsScreen(
  workOrderId: String,
  onBackClick: () -> Unit
) {
  val voiceNoteText = remember { mutableStateOf("") }
  val isRecording = remember { mutableStateOf(false) }

  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(Color(0xFF0A0A0A))
  ) {
    // Header
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .background(Color(0xFF1A1A1A))
        .padding(16.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Text(
        text = stringResource(R.string.live_tools_title),
        style = MaterialTheme.typography.headlineSmall,
        color = Color(0xFF00D9FF),
        fontWeight = FontWeight.Bold
      )

      Button(
        onClick = onBackClick,
        colors = ButtonDefaults.buttonColors(
          containerColor = Color(0xFF1A1A1A),
          contentColor = Color(0xFF00D9FF)
        )
      ) {
        Text("Back")
      }
    }

    Column(
      modifier = Modifier
        .fillMaxSize()
        .verticalScroll(rememberScrollState())
        .padding(16.dp)
    ) {
      // Passthrough Camera Section
      ToolSection(
        title = stringResource(R.string.passthrough_camera),
        content = {
          Box(
            modifier = Modifier
              .fillMaxWidth()
              .height(200.dp)
              .background(Color(0xFF2A2A2A)),
            contentAlignment = Alignment.Center
          ) {
            Text(
              "Passthrough Camera Feed\n(Quest camera overlay)",
              color = Color(0xFFA0A0A0),
              modifier = Modifier.padding(16.dp)
            )
          }
          Spacer(modifier = Modifier.height(8.dp))
          Text(
            "Camera enabled for XR overlay and AR annotation",
            color = Color(0xFF808080),
            style = MaterialTheme.typography.bodySmall
          )
        }
      )

      Spacer(modifier = Modifier.height(16.dp))

      // Tool Stream Section
      ToolSection(
        title = stringResource(R.string.tool_stream),
        content = {
          Box(
            modifier = Modifier
              .fillMaxWidth()
              .height(200.dp)
              .background(Color(0xFF2A2A2A)),
            contentAlignment = Alignment.Center
          ) {
            Text(
              "Real-time Tool Video\n(Manifold gauge, multimeter, etc.)",
              color = Color(0xFFA0A0A0),
              modifier = Modifier.padding(16.dp)
            )
          }
          Spacer(modifier = Modifier.height(8.dp))
          Text(
            "Streaming from phase 2 live API with 60fps",
            color = Color(0xFF808080),
            style = MaterialTheme.typography.bodySmall
          )
        }
      )

      Spacer(modifier = Modifier.height(16.dp))

      // Voice Notes Section
      ToolSection(
        title = stringResource(R.string.voice_notes),
        content = {
          Column {
            // Recording controls
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              Button(
                onClick = { isRecording.value = !isRecording.value },
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(
                  containerColor = if (isRecording.value) Color(0xFFFF0040) else Color(0xFF00FF41),
                  contentColor = Color.Black
                )
              ) {
                Text(
                  if (isRecording.value) stringResource(R.string.stop_recording)
                  else stringResource(R.string.start_recording),
                  fontWeight = FontWeight.Bold
                )
              }

              Button(
                onClick = { voiceNoteText.value = "" },
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(
                  containerColor = Color(0xFF1A1A1A),
                  contentColor = Color(0xFF00D9FF)
                )
              ) {
                Text("Clear", fontWeight = FontWeight.Bold)
              }
            }

            if (isRecording.value) {
              Spacer(modifier = Modifier.height(8.dp))
              Text(
                "● Recording...",
                color = Color(0xFFFF0040),
                fontWeight = FontWeight.Bold
              )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Transcription/text field
            TextField(
              value = voiceNoteText.value,
              onValueChange = { voiceNoteText.value = it },
              placeholder = {
                Text("Voice transcription or text notes...", color = Color(0xFF808080))
              },
              modifier = Modifier
                .fillMaxWidth()
                .height(100.dp),
              colors = TextFieldDefaults.colors(
                focusedContainerColor = Color(0xFF2A2A2A),
                unfocusedContainerColor = Color(0xFF1A1A1A),
                focusedTextColor = Color(0xFF00D9FF),
                unfocusedTextColor = Color(0xFFA0A0A0),
                focusedIndicatorColor = Color(0xFF00D9FF),
                unfocusedIndicatorColor = Color(0xFF808080)
              )
            )

            Spacer(modifier = Modifier.height(8.dp))

            Button(
              onClick = {
                // Save voice note
                voiceNoteText.value = ""
              },
              modifier = Modifier.fillMaxWidth(),
              colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF00D9FF),
                contentColor = Color.Black
              )
            ) {
              Text(stringResource(R.string.save), fontWeight = FontWeight.Bold)
            }
          }
        }
      )

      Spacer(modifier = Modifier.height(24.dp))

      // Tech notes
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .background(Color(0xFF1A1A1A))
          .padding(12.dp)
      ) {
        Column {
          Text(
            "XR Features:",
            color = Color(0xFF00D9FF),
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 8.dp)
          )
          Text(
            "• Hand tracking for gesture control",
            color = Color(0xFFA0A0A0),
            style = MaterialTheme.typography.bodySmall
          )
          Text(
            "• Passthrough camera for AR annotation",
            color = Color(0xFFA0A0A0),
            style = MaterialTheme.typography.bodySmall
          )
          Text(
            "• Real-time tool stream via WebSocket",
            color = Color(0xFFA0A0A0),
            style = MaterialTheme.typography.bodySmall
          )
          Text(
            "• Voice transcription with offline support",
            color = Color(0xFFA0A0A0),
            style = MaterialTheme.typography.bodySmall
          )
        }
      }
    }
  }
}

/**
 * Reusable tool section
 */
@Composable
fun ToolSection(
  title: String,
  content: @Composable () -> Unit
) {
  Column(
    modifier = Modifier
      .fillMaxWidth()
      .background(Color(0xFF1A1A1A))
      .padding(12.dp)
  ) {
    Text(
      text = title,
      color = Color(0xFF00D9FF),
      fontWeight = FontWeight.Bold,
      style = MaterialTheme.typography.titleSmall,
      modifier = Modifier.padding(bottom = 8.dp)
    )
    content()
  }
}
