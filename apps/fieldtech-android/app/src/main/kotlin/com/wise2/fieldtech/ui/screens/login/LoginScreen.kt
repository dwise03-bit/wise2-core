package com.wise2.fieldtech.ui.screens.login

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.wise2.fieldtech.BuildConfig
import com.wise2.fieldtech.R
import com.wise2.fieldtech.ui.theme.ChaosBlue
import com.wise2.fieldtech.ui.theme.ChromeSilver
import com.wise2.fieldtech.ui.theme.ElectricBlue
import com.wise2.fieldtech.ui.theme.FrostWhite
import com.wise2.fieldtech.ui.theme.InstrumentLine
import com.wise2.fieldtech.ui.theme.JetBlack
import com.wise2.fieldtech.ui.theme.MutedSteel
import com.wise2.fieldtech.ui.theme.OxideBlack
import com.wise2.fieldtech.ui.theme.PanelSteel

@Composable
fun LoginScreen(viewModel: LoginViewModel, onLoggedIn: () -> Unit) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val googleEnabled = BuildConfig.GOOGLE_WEB_CLIENT_ID.isNotBlank()

    val googleOptionsBuilder = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
        .requestEmail()
    if (googleEnabled) {
        googleOptionsBuilder.requestIdToken(BuildConfig.GOOGLE_WEB_CLIENT_ID)
    }
    val gso = googleOptionsBuilder.build()
    val googleSignInClient = remember { GoogleSignIn.getClient(context, gso) }
    val googleLauncher = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
        try {
            val idToken = task.getResult(ApiException::class.java).idToken
            if (idToken != null) viewModel.loginWithGoogle(idToken)
        } catch (_: ApiException) {
            viewModel.onGoogleLoginFailed()
        }
    }

    LaunchedEffect(state.loggedIn) {
        if (state.loggedIn) onLoggedIn()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    listOf(OxideBlack, JetBlack, OxideBlack),
                ),
            )
            .padding(horizontal = 24.dp, vertical = 34.dp),
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.Start,
        ) {
            Text("WISE²", style = MaterialTheme.typography.headlineLarge, color = FrostWhite, fontWeight = FontWeight.Black)
            Text("HVAC FIELD TECH", style = MaterialTheme.typography.labelLarge, color = ElectricBlue, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(10.dp))
            Text(stringRes(), style = MaterialTheme.typography.bodyLarge, color = MutedSteel)
            Spacer(Modifier.height(34.dp))

            OutlinedTextField(
                value = state.email,
                onValueChange = viewModel::onEmailChange,
                label = { Text("Email") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth(),
                colors = fieldTextColors(),
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
                colors = fieldTextColors(),
            )

            state.errorMessage?.let {
                Spacer(Modifier.height(12.dp))
                Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium)
            }

            Spacer(Modifier.height(24.dp))
            Button(
                onClick = viewModel::login,
                enabled = !state.isLoading,
                modifier = Modifier.fillMaxWidth().height(58.dp),
                colors = ButtonDefaults.buttonColors(containerColor = ElectricBlue, contentColor = JetBlack, disabledContainerColor = PanelSteel, disabledContentColor = MutedSteel),
            ) {
                if (state.isLoading) {
                    CircularProgressIndicator(modifier = Modifier.height(20.dp), color = ChaosBlue)
                } else {
                    Text("LOG IN", fontWeight = FontWeight.Black)
                }
            }
            Spacer(Modifier.height(12.dp))
            OutlinedButton(
                onClick = {
                    googleSignInClient.signOut().addOnCompleteListener {
                        googleLauncher.launch(googleSignInClient.signInIntent)
                    }
                },
                enabled = !state.isLoading && googleEnabled,
                modifier = Modifier.fillMaxWidth().height(56.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = ElectricBlue, disabledContentColor = MutedSteel),
            ) {
                Text(if (googleEnabled) "SIGN IN WITH GOOGLE" else "GOOGLE SIGN-IN NEEDS CONFIG", fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.height(28.dp))
            Text(
                "OFFLINE RECORDS STAY LOCAL. SYNC RESUMES WHEN WISE² RECONNECTS.",
                style = MaterialTheme.typography.labelLarge,
                color = ChromeSilver,
            )
        }
    }
}

@Composable
private fun stringRes(): String = androidx.compose.ui.res.stringResource(R.string.tagline_primary)

@Composable
private fun fieldTextColors() = OutlinedTextFieldDefaults.colors(
    focusedTextColor = FrostWhite,
    unfocusedTextColor = FrostWhite,
    focusedContainerColor = PanelSteel,
    unfocusedContainerColor = OxideBlack,
    focusedBorderColor = ElectricBlue,
    unfocusedBorderColor = InstrumentLine,
    focusedLabelColor = ElectricBlue,
    unfocusedLabelColor = MutedSteel,
    cursorColor = ElectricBlue,
)
