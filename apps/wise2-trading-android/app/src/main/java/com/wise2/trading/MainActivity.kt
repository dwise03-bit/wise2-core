package com.wise2.trading

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Bg = Color(0xFF050806)
private val Panel = Color(0xFF0C120E)
private val Panel2 = Color(0xFF111A13)
private val Neon = Color(0xFF77FF4D)
private val Silver = Color(0xFFE3E7E4)
private val Muted = Color(0xFF91A095)
private val Danger = Color(0xFFFF5D67)

private enum class Tab(val label: String) {
    Home("Home"), Scanner("Scanner"), Portfolio("Portfolio"), Strategies("Strategies"), Imp("IMP")
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { MaterialTheme { TradingApp() } }
    }
}

@Composable
private fun TradingApp() {
    var tab by remember { mutableStateOf(Tab.Home) }
    var selected by remember { mutableStateOf<MarketSetup?>(null) }
    val account = remember { PaperAccount(10_746.25, 19_420.00, 126.40, 2_310.00) }
    val setups = remember {
        listOf(
            MarketSetup("NVDA", "STOCK", "Momentum Pullback", 87, 127.40, 124.85, 134.10, 3.0, "Trend aligned, relative volume elevated, momentum strengthening."),
            MarketSetup("SPY", "ETF", "Trend Continuation", 82, 572.10, 568.40, 580.80, 1.0, "Broad-market trend remains constructive with healthy breadth."),
            MarketSetup("BTC/USD", "CRYPTO", "Crypto Trend", 79, 112340.0, 109900.0, 118500.0, 0.01, "Higher highs and expanding momentum with controlled sizing."),
            MarketSetup("AMD", "STOCK", "Breakout", 76, 168.20, 164.70, 176.50, 2.0, "Resistance test with improving volume and relative strength.")
        )
    }

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
                        colors = NavigationBarItemDefaults.colors(
                            selectedTextColor = Neon,
                            unselectedTextColor = Muted,
                            indicatorColor = Panel2
                        )
                    )
                }
            }
        },
        floatingActionButton = {
            Box(
                Modifier.size(62.dp).background(Neon, CircleShape).clickable { tab = Tab.Imp },
                contentAlignment = Alignment.Center
            ) { Text("🐂", fontSize = 28.sp) }
        }
    ) { inset ->
        Box(Modifier.fillMaxSize().background(Bg).padding(inset)) {
            when (tab) {
                Tab.Home -> Dashboard(account, setups, selected = { selected = it })
                Tab.Scanner -> Scanner(setups, selected = { selected = it })
                Tab.Portfolio -> Portfolio(account)
                Tab.Strategies -> Strategies()
                Tab.Imp -> Imp(setups.first())
            }
            selected?.let { TradeReview(it, account) { selected = null } }
        }
    }
}

@Composable
private fun Header() {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text("W² TRADING", color = Silver, fontSize = 24.sp, fontWeight = FontWeight.Black)
            Text("COMMAND CENTER · PAPER MODE", color = Neon, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        }
        Text("LIVE", color = Neon, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun Dashboard(account: PaperAccount, setups: List<MarketSetup>, selected: (MarketSetup) -> Unit) {
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Header() }
        item {
            PanelCard {
                Text("MARKET REGIME", color = Muted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("BULLISH TREND", color = Neon, fontSize = 22.sp, fontWeight = FontWeight.Black)
                        Text("Momentum strong · Volatility moderate", color = Silver, fontSize = 12.sp)
                    }
                    Text("84%", color = Neon, fontSize = 28.sp, fontWeight = FontWeight.Black)
                }
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Metric("Paper Equity", usd(account.equity), "+1.2% today", Modifier.weight(1f))
                Metric("WISE Guard", "PASS", "Risk mode normal", Modifier.weight(1f))
            }
        }
        item { Section("TOP AI SETUPS") }
        items(setups.take(3)) { SetupCard(it, selected) }
        item {
            PanelCard {
                Text("🐂  IMP INSIGHT", color = Neon, fontWeight = FontWeight.Black)
                Text("Momentum is leading today. Three setups meet WISE Guard rules. Review NVDA first.", color = Silver, modifier = Modifier.padding(top = 8.dp))
            }
        }
        item { Spacer(Modifier.height(70.dp)) }
    }
}

@Composable
private fun Scanner(setups: List<MarketSetup>, selected: (MarketSetup) -> Unit) {
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { Header() }
        item { Section("AI MARKET SCANNER") }
        item { Text("Stocks · ETFs · Crypto · Every paper order requires your approval.", color = Muted) }
        items(setups) { SetupCard(it, selected) }
    }
}

@Composable
private fun Portfolio(account: PaperAccount) {
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Header() }
        item { Section("PAPER PORTFOLIO") }
        item { Metric("Equity", usd(account.equity), "Paper account") }
        item { Metric("Buying Power", usd(account.buyingPower), "Available simulated capital") }
        item { Metric("Daily P/L", "+${usd(account.dailyPnl)}", "Open + closed") }
        item { Metric("Open Exposure", usd(account.openExposure), "21.5% of equity") }
        item {
            PanelCard {
                Text("SECURE BROKER ARCHITECTURE", color = Muted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                Text("WISE² API → Alpaca Paper", color = Neon, fontWeight = FontWeight.Bold)
                Text("Broker secret keys stay on the WISE² backend and are never stored in the APK.", color = Silver, fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun Strategies() {
    val data = listOf(
        "Momentum Pullback" to "+7.4%",
        "Crypto Trend" to "+6.2%",
        "Trend Continuation" to "+5.9%",
        "Breakout" to "+4.1%",
        "Mean Reversion" to "+1.3%"
    )
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { Header() }
        item { Section("STRATEGY ARENA") }
        items(data) { (name, result) ->
            PanelCard {
                Row(Modifier.fillMaxWidth()) {
                    Text(name, color = Silver, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                    Text(result, color = Neon, fontWeight = FontWeight.Black)
                }
            }
        }
    }
}

@Composable
private fun Imp(top: MarketSetup) {
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Header() }
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(82.dp).background(Neon, CircleShape), contentAlignment = Alignment.Center) { Text("🐂", fontSize = 42.sp) }
                Column(Modifier.padding(start = 14.dp)) {
                    Text("TRADING IMP", color = Neon, fontSize = 26.sp, fontWeight = FontWeight.Black)
                    Text("Active paper-trading copilot", color = Muted)
                }
            }
        }
        item {
            PanelCard {
                Text("CURRENT READ", color = Muted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                Text("${top.symbol} is ranked #1 at ${top.wiseScore}/100.", color = Silver, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                Text(top.thesis, color = Muted, modifier = Modifier.padding(top = 8.dp))
            }
        }
        items(listOf("Find my safest setup", "Explain today’s market regime", "Compare strategies", "Review my portfolio")) {
            PanelCard { Text("🐂  $it", color = Silver, fontWeight = FontWeight.SemiBold) }
        }
    }
}

@Composable
private fun SetupCard(setup: MarketSetup, selected: (MarketSetup) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable { selected(setup) },
        colors = CardDefaults.cardColors(containerColor = Panel),
        shape = RoundedCornerShape(14.dp)
    ) {
        Row(Modifier.fillMaxWidth().padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(setup.symbol, color = Silver, fontWeight = FontWeight.Black, fontSize = 18.sp)
                Text("${setup.assetClass} · ${setup.strategy}", color = Muted, fontSize = 11.sp)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(setup.wiseScore.toString(), color = Neon, fontSize = 22.sp, fontWeight = FontWeight.Black)
                Text("WISE SCORE", color = Muted, fontSize = 9.sp)
            }
        }
    }
}

@Composable
private fun TradeReview(setup: MarketSetup, account: PaperAccount, close: () -> Unit) {
    val loss = if (account.dailyPnl < 0) -account.dailyPnl else 0.0
    val decision = RiskGuard.evaluate(account.equity, setup.estimatedRisk, loss, account.openExposure)
    Box(Modifier.fillMaxSize().background(Color(0xDD000000)), contentAlignment = Alignment.BottomCenter) {
        Card(
            colors = CardDefaults.cardColors(containerColor = Panel2),
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("REVIEW PAPER TRADE", color = Neon, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Text("${setup.symbol} · ${setup.strategy}", color = Silver, fontSize = 22.sp, fontWeight = FontWeight.Black)
                Line("Entry", price(setup.entry))
                Line("Stop", price(setup.stop))
                Line("Target", price(setup.target))
                Line("Quantity", setup.quantity.toString())
                Line("Estimated risk", usd(setup.estimatedRisk))
                Line("Reward / Risk", "%.2f : 1".format(setup.rewardRisk))
                Text(setup.thesis, color = Silver, fontSize = 12.sp)
                Text(
                    if (decision.allowed) "WISE GUARD · PASS" else "WISE GUARD · BLOCKED",
                    color = if (decision.allowed) Neon else Danger,
                    fontWeight = FontWeight.Black
                )
                if (!decision.allowed) Text(decision.reasons.joinToString(" · "), color = Danger, fontSize = 11.sp)
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                    Button(onClick = close, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = Color.DarkGray)) { Text("REJECT") }
                    Button(
                        onClick = close,
                        enabled = decision.allowed,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = Neon, contentColor = Color.Black)
                    ) { Text("APPROVE PAPER", fontWeight = FontWeight.Black) }
                }
            }
        }
    }
}

@Composable
private fun Metric(title: String, value: String, note: String, modifier: Modifier = Modifier) {
    Card(modifier, colors = CardDefaults.cardColors(containerColor = Panel), shape = RoundedCornerShape(16.dp)) {
        Column(Modifier.padding(14.dp)) {
            Text(title.uppercase(), color = Muted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            Text(value, color = Neon, fontSize = 20.sp, fontWeight = FontWeight.Black)
            Text(note, color = Silver, fontSize = 10.sp)
        }
    }
}

@Composable
private fun Line(label: String, value: String) {
    Row(Modifier.fillMaxWidth()) {
        Text(label, color = Muted, modifier = Modifier.weight(1f))
        Text(value, color = Silver, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun Section(text: String) = Text(text, color = Silver, fontSize = 13.sp, fontWeight = FontWeight.Black)

@Composable
private fun PanelCard(content: @Composable ColumnScope.() -> Unit) {
    Card(colors = CardDefaults.cardColors(containerColor = Panel), shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), content = content)
    }
}

private fun usd(value: Double) = "$" + "%,.2f".format(value)
private fun price(value: Double) = "$" + if (value >= 1000) "%,.2f".format(value) else "%.2f".format(value)
