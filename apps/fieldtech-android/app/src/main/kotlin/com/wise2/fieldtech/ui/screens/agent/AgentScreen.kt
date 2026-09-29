package com.wise2.fieldtech.ui.screens.agent

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wise2.fieldtech.ui.theme.ElectricBlue
import java.text.SimpleDateFormat
import java.util.*

// Professional color palette
private val CarbonBlack = Color(0xFF0A0E27)
private val GunmetalDark = Color(0xFF1a2332)
private val GunmetalLight = Color(0xFF2d3748)
private val OrangeWarmth = Color(0xFFFF6B35)
private val NeonGreen = Color(0xFF00FF41)
private val MetallicSilver = Color(0xFFC0C0C0)

data class ChatMessage(
  val id: String,
  val role: String, // "user" or "assistant"
  val content: String,
  val timestamp: Long,
  val audioUrl: String? = null,
  val isLoading: Boolean = false
)

@Composable
fun AgentScreen(
  viewModel: AgentViewModel,
  onClose: () -> Unit,
) {
  val uiState by viewModel.uiState.collectAsState()
  var inputText by remember { mutableStateOf("") }
  var isRecording by remember { mutableStateOf(false) }

  Surface(
    modifier = Modifier.fillMaxSize(),
    color = CarbonBlack,
  ) {
    Column(modifier = Modifier.fillMaxSize()) {
      // Header
      AgentHeader(onClose = onClose, isRecording = isRecording)

      // Chat messages
      LazyColumn(
        modifier = Modifier
          .weight(1f)
          .fillMaxWidth()
          .padding(12.dp),
        reverseLayout = true,
        verticalArrangement = Arrangement.spacedBy(12.dp),
      ) {
        items(uiState.messages.reversed()) { message ->
          ChatMessageBubble(message = message)
        }
      }

      // Input area
      InputArea(
        inputText = inputText,
        onInputChange = { inputText = it },
        onSendMessage = {
          if (inputText.isNotBlank()) {
            viewModel.sendMessage(inputText)
            inputText = ""
          }
        },
        onRecordStart = {
          isRecording = true
          viewModel.startVoiceCapture()
        },
        onRecordStop = {
          isRecording = false
          viewModel.stopVoiceCapture()
        },
        isRecording = isRecording,
        isLoading = uiState.isLoading,
      )
    }
  }
}

@Composable
fun AgentHeader(
  onClose: () -> Unit,
  isRecording: Boolean,
) {
  Row(
    modifier = Modifier
      .fillMaxWidth()
      .background(GunmetalDark)
      .padding(horizontal = 12.dp, vertical = 8.dp),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.CenterVertically,
  ) {
    Column(modifier = Modifier.weight(1f)) {
      Text(
        "WISE² HVAC Agent",
        fontSize = 14.sp,
        fontWeight = FontWeight.Bold,
        color = ElectricBlue,
        letterSpacing = 0.5.sp,
      )
      Text(
        if (isRecording) "🎙️ Listening..." else "Ready to assist",
        fontSize = 10.sp,
        color = if (isRecording) NeonGreen else MetallicSilver,
      )
    }

    IconButton(onClick = onClose) {
      Icon(
        Icons.Filled.Close,
        contentDescription = "Close",
        tint = MetallicSilver,
      )
    }
  }
}

@Composable
fun ChatMessageBubble(message: ChatMessage) {
  val isUser = message.role == "user"
  val timeFormat = SimpleDateFormat("h:mm a", Locale.getDefault())

  Row(
    modifier = Modifier
      .fillMaxWidth()
      .padding(vertical = 4.dp),
    horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start,
  ) {
    Surface(
      modifier = Modifier
        .widthIn(max = 300.dp)
        .clip(RoundedCornerShape(12.dp)),
      color = if (isUser) ElectricBlue else GunmetalLight,
    ) {
      Column(
        modifier = Modifier.padding(12.dp),
      ) {
        if (message.isLoading) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
          ) {
            Text(
              "Agent thinking...",
              fontSize = 12.sp,
              color = MetallicSilver,
              fontWeight = FontWeight.Bold,
            )
            LoadingDots()
          }
        } else {
          Text(
            message.content,
            fontSize = 12.sp,
            color = if (isUser) CarbonBlack else Color.White,
            lineHeight = 16.sp,
          )

          if (message.audioUrl != null && !isUser) {
            Spacer(modifier = Modifier.height(8.dp))
            AudioPlaybackButton(audioUrl = message.audioUrl)
          }

          Spacer(modifier = Modifier.height(6.dp))
          Text(
            timeFormat.format(Date(message.timestamp)),
            fontSize = 9.sp,
            color = if (isUser) Color.White.copy(alpha = 0.7f) else Color.Gray,
          )
        }
      }
    }
  }
}

@Composable
fun LoadingDots() {
  Row(
    horizontalArrangement = Arrangement.spacedBy(3.dp),
    verticalAlignment = Alignment.CenterVertically,
  ) {
    repeat(3) {
      Box(
        modifier = Modifier
          .size(4.dp)
          .clip(RoundedCornerShape(2.dp))
          .background(MetallicSilver)
      )
    }
  }
}

@Composable
fun AudioPlaybackButton(audioUrl: String) {
  Button(
    onClick = { /* TODO: Play audio */ },
    modifier = Modifier
      .height(32.dp)
      .fillMaxWidth(),
    colors = ButtonDefaults.buttonColors(
      containerColor = OrangeWarmth,
    ),
    shape = RoundedCornerShape(6.dp),
  ) {
    Row(
      horizontalArrangement = Arrangement.spacedBy(6.dp),
      verticalAlignment = Alignment.CenterVertically,
    ) {
      Icon(
        Icons.Filled.PlayArrow,
        contentDescription = "Play",
        tint = Color.White,
        modifier = Modifier.size(16.dp),
      )
      Text(
        "Play Response",
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        color = Color.White,
      )
    }
  }
}

@Composable
fun InputArea(
  inputText: String,
  onInputChange: (String) -> Unit,
  onSendMessage: () -> Unit,
  onRecordStart: () -> Unit,
  onRecordStop: () -> Unit,
  isRecording: Boolean,
  isLoading: Boolean,
) {
  Row(
    modifier = Modifier
      .fillMaxWidth()
      .background(GunmetalDark)
      .padding(12.dp),
    horizontalArrangement = Arrangement.spacedBy(8.dp),
    verticalAlignment = Alignment.Bottom,
  ) {
    // Microphone button
    if (isRecording) {
      Button(
        onClick = onRecordStop,
        modifier = Modifier
          .size(48.dp),
        colors = ButtonDefaults.buttonColors(
          containerColor = OrangeWarmth,
        ),
        shape = RoundedCornerShape(8.dp),
      ) {
        Icon(
          Icons.Filled.Mic,
          contentDescription = "Stop",
          tint = Color.White,
          modifier = Modifier.size(24.dp),
        )
      }
    } else {
      Button(
        onClick = onRecordStart,
        modifier = Modifier
          .size(48.dp),
        colors = ButtonDefaults.buttonColors(
          containerColor = GunmetalLight,
        ),
        shape = RoundedCornerShape(8.dp),
      ) {
        Icon(
          Icons.Filled.Mic,
          contentDescription = "Record",
          tint = ElectricBlue,
          modifier = Modifier.size(24.dp),
        )
      }
    }

    // Text input
    TextField(
      value = inputText,
      onValueChange = onInputChange,
      modifier = Modifier
        .weight(1f)
        .heightIn(min = 48.dp, max = 120.dp),
      placeholder = {
        Text("Ask agent...", fontSize = 12.sp, color = Color.Gray)
      },
      colors = TextFieldDefaults.colors(
        focusedContainerColor = GunmetalLight,
        unfocusedContainerColor = GunmetalLight,
        focusedTextColor = Color.White,
        unfocusedTextColor = Color.White,
      ),
      shape = RoundedCornerShape(8.dp),
    )

    // Send button
    Button(
      onClick = onSendMessage,
      modifier = Modifier
        .size(48.dp),
      enabled = !isLoading && inputText.isNotBlank(),
      colors = ButtonDefaults.buttonColors(
        containerColor = ElectricBlue,
        disabledContainerColor = Color.Gray.copy(alpha = 0.3f),
      ),
      shape = RoundedCornerShape(8.dp),
    ) {
      Icon(
        Icons.Filled.Send,
        contentDescription = "Send",
        tint = CarbonBlack,
        modifier = Modifier.size(20.dp),
      )
    }
  }
}
