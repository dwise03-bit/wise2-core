package com.wise2.trading

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

private val Bg = Color(0xFF050806)
private val Panel = Color(0xFF0C120E)
private val Panel2 = Color(0xFF111A13)
private val Neon = Color(0xFF77FF4D)
private val Silver = Color(0xFFE3E7E4)
private val Muted = Color(0xFF91A095)
private val Danger = Color(0xFFFF5D67)
private enum class Tab(val label: String) { Home("Home"), Scanner("Scanner"), Portfolio("Portfolio"), Strategies("Strategies"), Imp("IMP") }

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { MaterialTheme { TradingApp() } }
    }
}

@Composable
private fun TradingApp() {
    val repository = remember { TradingRepository() }
    val scope = rememberCoroutineScope()
    var tab by remember { mutableStateOf(Tab.Home) }
    var selected by remember { mutableStateOf<MarketSetup?>(null) }
    var account by remember { mutableStateOf<PaperAccount?>(null) }
    var setups by remember { mutableStateOf<List<MarketSetup>>(emptyList()) }
    var status by remember { mutableStateOf("CONNECTING TO WISE²") }
    var orderStatus by remember { mutableStateOf<String?>(null) }

    fun refresh() {
        scope.launch {
            val accountResult = repository.loadPaperAccount()
            val scannerResult = repository.loadScanner()
            accountResult.onSuccess { account = it }
            scannerResult.onSuccess { setups = it }
            status = if (accountResult.isSuccess && scannerResult.isSuccess) "ALPACA PAPER · LIVE" else "BACKEND NEEDS CONFIG"
        }
    }

    LaunchedEffect(Unit) { refresh() }
    val visibleAccount = account ?: PaperAccount(0.0, 0.0, 0.0, 0.0)

    Scaffold(
        containerColor = Bg,
        bottomBar = {
            NavigationBar(containerColor = Panel) {
                Tab.entries.forEach { item ->
                    NavigationBarItem(
                        selected = item == tab,
                        onClick = { tab = item },
                        icon = { Text(if (item == Tab.Imp) "🐂" else "•", color = if (item == tab) Neon else Muted) },
                        label = { Text(item.label, fontSize = 10.sp) },
                        colors = NavigationBarItemDefaults.colors(selectedTextColor = Neon, unselectedTextColor = Muted, indicatorColor = Panel2)
                    )
                }
            }
        },
        floatingActionButton = {
            Box(Modifier.size(62.dp).background(Neon, CircleShape).clickable { tab = Tab.Imp }, contentAlignment = Alignment.Center) { Text("🐂", fontSize = 28.sp) }
        }
    ) { inset ->
        Box(Modifier.fillMaxSize().background(Bg).padding(inset)) {
            when (tab) {
                Tab.Home -> Dashboard(visibleAccount, setups, status, { selected = it }, ::refresh)
                Tab.Scanner -> Scanner(setups, status, { selected = it }, ::refresh)
                Tab.Portfolio -> Portfolio(visibleAccount, status, ::refresh)
                Tab.Strategies -> Strategies()
                Tab.Imp -> Imp(setups.firstOrNull())
            }
            selected?.let { setup ->
                TradeReview(setup, visibleAccount, orderStatus, close = { selected = null; orderStatus = null }) {
                    orderStatus = "SUBMITTING TO ALPACA PAPER…"
                    scope.launch {
                        repository.submitApprovedPaperOrder(setup)
                            .onSuccess { orderStatus = "${it.status.uppercase()} · ${it.id.take(8)}"; refresh() }
                            .onFailure { orderStatus = "ORDER FAILED · ${it.message ?: "WISE Guard / backend rejected request"}" }
                    }
                }
            }
        }
    }
}

@Composable private fun Header(status: String = "PAPER MODE") {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text("W² TRADING", color = Silver, fontSize = 24.sp, fontWeight = FontWeight.Black)
            Text("COMMAND CENTER · $status", color = Neon, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        }
        Text("v0.2", color = Muted, fontWeight = FontWeight.Bold)
    }
}

@Composable private fun Dashboard(account: PaperAccount, setups: List<MarketSetup>, status: String, selected: (MarketSetup) -> Unit, refresh: () -> Unit) {
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Header(status) }
        item { PanelCard { Text("LIVE PAPER CONNECTION", color = Muted, fontSize = 10.sp, fontWeight = FontWeight.Bold); Text(status, color = if (status.contains("LIVE")) Neon else Danger, fontWeight = FontWeight.Black); Text("WISE² API → Alpaca Paper. Every order requires your tap.", color = Silver, fontSize = 12.sp) } }
        item { Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) { Metric("Paper Equity", usd(account.equity), "Alpaca paper", Modifier.weight(1f)); Metric("WISE Guard", if (account.equity > 0) "PASS" else "WAIT", "Server + device gates", Modifier.weight(1f)) } }
        item { Section("TOP LIVE SETUPS") }
        if (setups.isEmpty()) item { PanelCard { Text("No live scanner data yet.", color = Silver); Button(onClick = refresh) { Text("RETRY") } } }
        items(setups.take(3)) { SetupCard(it, selected) }
        item { PanelCard { Text("🐂  IMP INSIGHT", color = Neon, fontWeight = FontWeight.Black); Text(if (setups.isEmpty()) "Waiting for live Alpaca market snapshots." else "${setups.first().symbol} currently leads the WISE² scanner. Review risk before approval.", color = Silver, modifier = Modifier.padding(top = 8.dp)) } }
        item { Spacer(Modifier.height(70.dp)) }
    }
}

@Composable private fun Scanner(setups: List<MarketSetup>, status: String, selected: (MarketSetup) -> Unit, refresh: () -> Unit) {
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { Header(status) }; item { Section("AI MARKET SCANNER") }; item { Text("Stocks · ETFs · Crypto · Live Alpaca snapshots through WISE².", color = Muted) }
        if (setups.isEmpty()) item { Button(onClick = refresh) { Text("RETRY LIVE SCANNER") } }
        items(setups) { SetupCard(it, selected) }
    }
}

@Composable private fun Portfolio(account: PaperAccount, status: String, refresh: () -> Unit) {
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Header(status) }; item { Section("ALPACA PAPER PORTFOLIO") }; item { Metric("Equity", usd(account.equity), "Live paper account") }; item { Metric("Buying Power", usd(account.buyingPower), "Available simulated capital") }; item { Metric("Daily P/L", usd(account.dailyPnl), "Versus last equity") }; item { Metric("Open Exposure", usd(account.openExposure), "Absolute market value") }
        item { PanelCard { Text("SECURE BROKER ARCHITECTURE", color = Muted, fontSize = 10.sp, fontWeight = FontWeight.Bold); Text("WISE² API → Alpaca Paper", color = Neon, fontWeight = FontWeight.Bold); Text("Alpaca API keys stay on the WISE² backend. They are not embedded in this APK.", color = Silver, fontSize = 12.sp); Button(onClick = refresh) { Text("REFRESH") } } }
    }
}

@Composable private fun Strategies() { val data = listOf("Momentum Pullback", "Crypto Trend", "Trend Continuation", "Breakout", "Mean Reversion"); LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) { item { Header() }; item { Section("STRATEGY ARENA") }; items(data) { name -> PanelCard { Text(name, color = Silver, fontWeight = FontWeight.Bold); Text("Paper validation required before promotion", color = Muted, fontSize = 11.sp) } } } }

@Composable private fun Imp(top: MarketSetup?) { LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) { item { Header() }; item { Row(verticalAlignment = Alignment.CenterVertically) { Box(Modifier.size(82.dp).background(Neon, CircleShape), contentAlignment = Alignment.Center) { Text("🐂", fontSize = 42.sp) }; Column(Modifier.padding(start = 14.dp)) { Text("TRADING IMP", color = Neon, fontSize = 26.sp, fontWeight = FontWeight.Black); Text("Paper-trading copilot", color = Muted) } } }; item { PanelCard { Text("CURRENT READ", color = Muted, fontSize = 10.sp, fontWeight = FontWeight.Bold); Text(top?.let { "${it.symbol} leads at ${it.wiseScore}/100." } ?: "Waiting for scanner data.", color = Silver, fontSize = 17.sp, fontWeight = FontWeight.Bold); Text(top?.thesis ?: "Connect the WISE² backend to Alpaca paper credentials.", color = Muted, modifier = Modifier.padding(top = 8.dp)) } } } }

@Composable private fun SetupCard(setup: MarketSetup, selected: (MarketSetup) -> Unit) { Card(Modifier.fillMaxWidth().clickable { selected(setup) }, colors = CardDefaults.cardColors(containerColor = Panel), shape = RoundedCornerShape(14.dp)) { Row(Modifier.fillMaxWidth().padding(14.dp), verticalAlignment = Alignment.CenterVertically) { Column(Modifier.weight(1f)) { Text(setup.symbol, color = Silver, fontWeight = FontWeight.Black, fontSize = 18.sp); Text("${setup.assetClass} · ${setup.strategy}", color = Muted, fontSize = 11.sp); Text(price(setup.entry), color = Silver, fontSize = 12.sp) }; Column(horizontalAlignment = Alignment.End) { Text(setup.wiseScore.toString(), color = Neon, fontSize = 22.sp, fontWeight = FontWeight.Black); Text("WISE SCORE", color = Muted, fontSize = 9.sp) } } } }

@Composable private fun TradeReview(setup: MarketSetup, account: PaperAccount, orderStatus: String?, close: () -> Unit, approve: () -> Unit) {
    val loss = if (account.dailyPnl < 0) -account.dailyPnl else 0.0; val decision = RiskGuard.evaluate(account.equity, setup.estimatedRisk, loss, account.openExposure)
    Box(Modifier.fillMaxSize().background(Color(0xDD000000)), contentAlignment = Alignment.BottomCenter) { Card(colors = CardDefaults.cardColors(containerColor = Panel2), shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp), modifier = Modifier.fillMaxWidth()) { Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) { Text("REVIEW ALPACA PAPER TRADE", color = Neon, fontSize = 11.sp, fontWeight = FontWeight.Bold); Text("${setup.symbol} · ${setup.strategy}", color = Silver, fontSize = 22.sp, fontWeight = FontWeight.Black); Line("Entry", price(setup.entry)); Line("Stop", price(setup.stop)); Line("Target", price(setup.target)); Line("Quantity", setup.quantity.toString()); Line("Estimated risk", usd(setup.estimatedRisk)); Line("Reward / Risk", "%.2f : 1".format(setup.rewardRisk)); Text(setup.thesis, color = Silver, fontSize = 12.sp); Text(if (decision.allowed) "WISE GUARD · PASS" else "WISE GUARD · BLOCKED", color = if (decision.allowed) Neon else Danger, fontWeight = FontWeight.Black); if (!decision.allowed) Text(decision.reasons.joinToString(" · "), color = Danger, fontSize = 11.sp); orderStatus?.let { Text(it, color = if (it.startsWith("ORDER FAILED")) Danger else Neon, fontSize = 11.sp, fontWeight = FontWeight.Bold) }; Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) { Button(onClick = close, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = Color.DarkGray)) { Text("REJECT") }; Button(onClick = approve, enabled = decision.allowed && orderStatus == null, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = Neon, contentColor = Color.Black)) { Text("APPROVE PAPER", fontWeight = FontWeight.Black) } } } } }
}

@Composable private fun Metric(title: String, value: String, note: String, modifier: Modifier = Modifier) { Card(modifier, colors = CardDefaults.cardColors(containerColor = Panel), shape = RoundedCornerShape(16.dp)) { Column(Modifier.padding(14.dp)) { Text(title.uppercase(), color = Muted, fontSize = 10.sp, fontWeight = FontWeight.Bold); Text(value, color = Neon, fontSize = 20.sp, fontWeight = FontWeight.Black); Text(note, color = Silver, fontSize = 10.sp) } } }
@Composable private fun Line(label: String, value: String) { Row(Modifier.fillMaxWidth()) { Text(label, color = Muted, modifier = Modifier.weight(1f)); Text(value, color = Silver, fontWeight = FontWeight.Bold) } }
@Composable private fun Section(text: String) = Text(text, color = Silver, fontSize = 13.sp, fontWeight = FontWeight.Black)
@Composable private fun PanelCard(content: @Composable ColumnScope.() -> Unit) { Card(colors = CardDefaults.cardColors(containerColor = Panel), shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) { Column(Modifier.padding(16.dp), content = content) } }
private fun usd(value: Double) = "$" + "%,.2f".format(value)
private fun price(value: Double) = "$" + if (value >= 1000) "%,.2f".format(value) else "%.2f".format(value)
