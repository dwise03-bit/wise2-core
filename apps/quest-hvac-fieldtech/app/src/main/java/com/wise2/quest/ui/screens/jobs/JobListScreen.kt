package com.wise2.quest.ui.screens.jobs

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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wise2.quest.R
import com.wise2.quest.data.models.WorkOrder

/**
 * Job list screen showing available work orders
 */
@Composable
fun JobListScreen(
  viewModel: JobListViewModel,
  onJobSelected: (String) -> Unit,
  onLogout: () -> Unit
) {
  val jobs = viewModel.jobs.collectAsState()
  val uiState = viewModel.uiState.collectAsState()

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
        text = stringResource(R.string.jobs_title),
        style = MaterialTheme.typography.headlineSmall,
        color = Color(0xFF00D9FF),
        fontWeight = FontWeight.Bold
      )

      Button(
        onClick = onLogout,
        colors = ButtonDefaults.buttonColors(
          containerColor = Color(0xFF1A1A1A),
          contentColor = Color(0xFF00D9FF)
        )
      ) {
        Text("Logout")
      }
    }

    // Content
    when (uiState.value) {
      is JobListUiState.Loading -> {
        Box(
          modifier = Modifier
            .fillMaxSize(),
          contentAlignment = Alignment.Center
        ) {
          CircularProgressIndicator(color = Color(0xFF00D9FF))
        }
      }

      is JobListUiState.Success -> {
        LazyColumn(
          modifier = Modifier
            .fillMaxSize()
            .padding(8.dp)
        ) {
          items(jobs.value) { workOrder ->
            JobCard(
              workOrder = workOrder,
              onClick = { onJobSelected(workOrder.id) }
            )
          }
        }
      }

      is JobListUiState.Empty -> {
        Box(
          modifier = Modifier
            .fillMaxSize(),
          contentAlignment = Alignment.Center
        ) {
          Text(
            stringResource(R.string.no_jobs),
            color = Color(0xFFA0A0A0)
          )
        }
      }

      is JobListUiState.Error -> {
        Box(
          modifier = Modifier
            .fillMaxSize(),
          contentAlignment = Alignment.Center
        ) {
          Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(16.dp)
          ) {
            Text(
              text = stringResource(R.string.error),
              color = Color(0xFFFF0040),
              fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
              text = (uiState.value as JobListUiState.Error).message,
              color = Color(0xFFA0A0A0)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Button(
              onClick = { viewModel.refreshJobs() },
              colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF00D9FF),
                contentColor = Color.Black
              )
            ) {
              Text(stringResource(R.string.retry))
            }
          }
        }
      }
    }
  }
}

/**
 * Individual job card
 */
@Composable
fun JobCard(
  workOrder: WorkOrder,
  onClick: () -> Unit
) {
  Column(
    modifier = Modifier
      .fillMaxWidth()
      .background(Color(0xFF1A1A1A))
      .clickable { onClick() }
      .padding(16.dp)
      .padding(bottom = 8.dp)
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Column(modifier = Modifier.weight(1f)) {
        Text(
          text = workOrder.serviceType,
          style = MaterialTheme.typography.bodyLarge,
          color = Color(0xFF00D9FF),
          fontWeight = FontWeight.Bold
        )

        Text(
          text = workOrder.customerName,
          style = MaterialTheme.typography.bodySmall,
          color = Color(0xFFA0A0A0)
        )

        Text(
          text = "${workOrder.address}, ${workOrder.city}, ${workOrder.state}",
          style = MaterialTheme.typography.bodySmall,
          color = Color(0xFF808080),
          modifier = Modifier.padding(top = 4.dp)
        )
      }

      Spacer(modifier = Modifier.width(8.dp))

      // Priority and status badge
      Column(
        horizontalAlignment = Alignment.End
      ) {
        Box(
          modifier = Modifier
            .background(
              color = when (workOrder.priority) {
                "high" -> Color(0xFFFF0040)
                "normal" -> Color(0xFFFFB700)
                else -> Color(0xFF00FF41)
              },
              shape = androidx.compose.foundation.shape.RoundedCornerShape(4.dp)
            )
            .padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
          Text(
            text = when (workOrder.priority) {
              "high" -> stringResource(R.string.job_priority_high)
              else -> stringResource(R.string.job_priority_normal)
            },
            color = Color.Black,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold
          )
        }

        Spacer(modifier = Modifier.height(4.dp))

        Text(
          text = workOrder.status,
          color = Color(0xFF00FF41),
          style = MaterialTheme.typography.labelSmall
        )
      }
    }
  }
}
