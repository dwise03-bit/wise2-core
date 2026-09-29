package com.wise2.quest.ui.screens.login

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontSize
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wise2.quest.R

/**
 * Login screen with Google OAuth and WISE² authentication options
 */
@Composable
fun LoginScreen(
  viewModel: LoginViewModel,
  onLoginSuccess: () -> Unit
) {
  val uiState = viewModel.uiState.collectAsState()

  LaunchedEffect(Unit) {
    viewModel.checkExistingAuth()
  }

  LaunchedEffect(uiState.value) {
    if (uiState.value is LoginUiState.Success) {
      onLoginSuccess()
    }
  }

  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(Color(0xFF0A0A0A))
      .padding(32.dp),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.Center
  ) {
    // Title
    Text(
      text = stringResource(R.string.login_title),
      style = MaterialTheme.typography.headlineLarge,
      color = Color(0xFF00D9FF),
      fontWeight = FontWeight.Bold
    )

    Spacer(modifier = Modifier.height(8.dp))

    // Subtitle
    Text(
      text = stringResource(R.string.login_subtitle),
      style = MaterialTheme.typography.bodyLarge,
      color = Color(0xFFA0A0A0)
    )

    Spacer(modifier = Modifier.height(48.dp))

    when (val state = uiState.value) {
      is LoginUiState.Idle -> {
        // Google Sign-In Button
        Button(
          onClick = {
            // In real app, trigger Google OAuth flow
            viewModel.handleGoogleAuthToken("mock-google-token")
          },
          modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
          colors = ButtonDefaults.buttonColors(
            containerColor = Color.White,
            contentColor = Color.Black
          )
        ) {
          Text(
            stringResource(R.string.sign_in_with_google),
            fontWeight = FontWeight.Bold
          )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // WISE² Sign-In Button
        Button(
          onClick = {
            // In real app, show WISE² login form
            viewModel.handleWise2Login("tech@wise2.net", "password")
          },
          modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
          colors = ButtonDefaults.buttonColors(
            containerColor = Color(0xFF00D9FF),
            contentColor = Color.Black
          )
        ) {
          Text(
            stringResource(R.string.sign_in_with_wise2),
            fontWeight = FontWeight.Bold
          )
        }
      }

      is LoginUiState.Loading -> {
        CircularProgressIndicator(
          color = Color(0xFF00D9FF),
          modifier = Modifier.height(64.dp)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
          stringResource(R.string.logging_in),
          color = Color(0xFF00D9FF)
        )
      }

      is LoginUiState.Error -> {
        Text(
          text = stringResource(R.string.login_error),
          color = Color(0xFFFF0040),
          fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
          text = state.message,
          color = Color(0xFFA0A0A0),
          modifier = Modifier.padding(horizontal = 16.dp)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(
          onClick = { viewModel.resetState() },
          colors = ButtonDefaults.buttonColors(
            containerColor = Color(0xFF00D9FF),
            contentColor = Color.Black
          )
        ) {
          Text(stringResource(R.string.retry))
        }
      }

      is LoginUiState.Success -> {
        CircularProgressIndicator(color = Color(0xFF00FF41))
      }
    }
  }
}
