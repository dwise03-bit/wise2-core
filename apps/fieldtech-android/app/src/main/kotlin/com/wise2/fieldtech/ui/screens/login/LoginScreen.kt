package com.wise2.fieldtech.ui.screens.login

import android.app.Activity
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.wise2.fieldtech.R
import com.wise2.fieldtech.ui.theme.ChaosBlue
import com.wise2.fieldtech.ui.theme.ElectricBlue

private const val GOOGLE_WEB_CLIENT_ID = "YOUR_GOOGLE_WEB_CLIENT_ID"
private const val GOOGLE_SIGN_IN_REQUEST_CODE = 9001

@Composable
fun LoginScreen(viewModel: LoginViewModel, onLoggedIn: () -> Unit) {
    val state by viewModel.uiState.collectAsState()
    var demoMode by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val activity = context as? Activity

    val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
        .requestIdToken(GOOGLE_WEB_CLIENT_ID)
        .requestEmail()
        .build()
    val googleSignInClient = remember { GoogleSignIn.getClient(context, gso) }

    LaunchedEffect(state.loggedIn) {
        if (state.loggedIn) onLoggedIn()
    }

    if (demoMode) {
        onLoggedIn()
        return
    }

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("WISE² FIELD TECH", style = MaterialTheme.typography.headlineLarge, color = ElectricBlue, textAlign = TextAlign.Center)
        Spacer(Modifier.height(8.dp))
        Text(stringRes(), style = MaterialTheme.typography.bodyMedium, textAlign = TextAlign.Center)
        Spacer(Modifier.height(32.dp))

        OutlinedTextField(
            value = state.email,
            onValueChange = viewModel::onEmailChange,
            label = { Text("Email") },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = state.password,
            onValueChange = viewModel::onPasswordChange,
            label = { Text("Password") },
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            modifier = Modifier.fillMaxWidth(),
        )

        state.errorMessage?.let {
            Spacer(Modifier.height(12.dp))
            Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium)
        }

        Spacer(Modifier.height(24.dp))
        Button(
            onClick = viewModel::login,
            enabled = !state.isLoading,
            modifier = Modifier.fillMaxWidth().height(56.dp),
        ) {
            if (state.isLoading) {
                CircularProgressIndicator(modifier = Modifier.height(20.dp), color = ChaosBlue)
            } else {
                Text("LOG IN")
            }
        }
        Spacer(Modifier.height(12.dp))
        OutlinedButton(
            onClick = {
                activity?.let {
                    googleSignInClient.signOut().addOnCompleteListener {
                        val signInIntent = googleSignInClient.signInIntent
                        it.startActivityForResult(signInIntent, GOOGLE_SIGN_IN_REQUEST_CODE)
                    }
                }
            },
            enabled = !state.isLoading,
            modifier = Modifier.fillMaxWidth().height(56.dp),
        ) {
            Text("SIGN IN WITH GOOGLE", color = ElectricBlue)
        }
        Spacer(Modifier.height(16.dp))
        TextButton(onClick = { demoMode = true }, modifier = Modifier.fillMaxWidth()) {
            Text("DEMO MODE", color = ElectricBlue)
        }
    }
}

@Composable
private fun stringRes(): String = androidx.compose.ui.res.stringResource(R.string.tagline_primary)
