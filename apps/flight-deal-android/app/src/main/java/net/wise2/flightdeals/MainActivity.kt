package net.wise2.flightdeals
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
class MainActivity:ComponentActivity(){override fun onCreate(savedInstanceState:Bundle?){super.onCreate(savedInstanceState);setContent{MaterialTheme(colorScheme=darkColorScheme()){FlightDeals{startActivity(Intent(Intent.ACTION_VIEW,Uri.parse(it)))}}}}}
@Composable fun FlightDeals(open:(String)->Unit){var from by remember{mutableStateOf("GSO, RDU, CLT")};var to by remember{mutableStateOf("LGA, JFK, EWR")};var date by remember{mutableStateOf("Tomorrow")};Surface(Modifier.fillMaxSize()){Column(Modifier.padding(18.dp)){Text("WISE² FLIGHT DEAL HUNTER",style=MaterialTheme.typography.headlineSmall);Text("REAL FARES • TOTAL COST • FAST BOOKING");Spacer(Modifier.height(18.dp));OutlinedTextField(from,{from=it},label={Text("FROM — multi-airport")},modifier=Modifier.fillMaxWidth());OutlinedTextField(to,{to=it},label={Text("TO — multi-airport")},modifier=Modifier.fillMaxWidth());OutlinedTextField(date,{date=it},label={Text("DATE")},modifier=Modifier.fillMaxWidth());Spacer(Modifier.height(12.dp));Button(onClick={},modifier=Modifier.fillMaxWidth()){Text("HUNT DEALS")};Spacer(Modifier.height(12.dp));Text("Fare API connection pending. Teaser prices are never labeled VERIFIED.")}}}
