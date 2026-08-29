import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var viewModel: FieldTechViewModel

    var body: some View {
        ZStack {
            WISEColor.bgPrimary.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: WISESpacing.lg) {
                    // MARK: - Header
                    headerSection

                    // MARK: - Active Job
                    if let firstJob = viewModel.jobs.first {
                        activeJobSection(job: firstJob)
                    }

                    // MARK: - System Status Gauges
                    systemStatusSection

                    // MARK: - Quick Actions
                    quickActionsSection

                    // MARK: - IMP Tech
                    impTechSection

                    Spacer(minLength: WISESpacing.xl)
                }
                .padding(WISESpacing.lg)
            }
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: "wrench.and.screwdriver.fill")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(WISEColor.wiseGreen)

                Text("WISE²")
                    .font(WISETypography.logoTitle)
                    .foregroundColor(WISEColor.metalDark)
                    .tracking(1.5)

                Spacer()

                Image(systemName: "bell.badge")
                    .foregroundColor(WISEColor.wiseGreen)
                    .font(.system(size: 18, weight: .semibold))
            }

            Text("FIELD TECH COPILOT")
                .font(WISETypography.screenTitle)
                .foregroundColor(WISEColor.textPrimary)
                .tracking(0.5)

            Text("ORGANIZED CHAOS. BETTER RESULTS.")
                .font(WISETypography.captionSmall)
                .foregroundColor(WISEColor.textMuted)
                .tracking(1.2)
        }
    }

    // MARK: - Active Job Panel

    private func activeJobSection(job: FieldTechJob) -> some View {
        VStack(alignment: .leading, spacing: WISESpacing.md) {
            HStack {
                Text("ACTIVE JOB")
                    .font(WISETypography.caption)
                    .foregroundColor(WISEColor.textSecondary)

                Spacer()

                Text("#\(job.id)")
                    .font(WISETypography.diagnostic)
                    .foregroundColor(WISEColor.wiseGreen)
            }

            Text(job.complaint)
                .font(WISETypography.bodyLarge)
                .foregroundColor(WISEColor.textPrimary)

            HStack(spacing: WISESpacing.sm) {
                Label(job.priority.uppercased(), systemImage: "exclamationmark.circle.fill")
                    .font(WISETypography.caption)
                    .foregroundColor(WISEColor.faultRed)

                Spacer()

                Text("On Site")
                    .font(WISETypography.caption)
                    .foregroundColor(WISEColor.wiseGreen)
            }

            VStack(alignment: .leading, spacing: 6) {
                Label(job.customerName, systemImage: "person.fill")
                    .font(WISETypography.body)

                Label(job.address, systemImage: "mappin.and.ellipse")
                    .font(WISETypography.body)

                if let phone = job.customerPhone {
                    Label(phone, systemImage: "phone.fill")
                        .font(WISETypography.body)
                }

                Label("York YCZ048S4S • 4 Ton", systemImage: "cube.fill")
                    .font(WISETypography.body)

                Label("Today 10:00 AM", systemImage: "calendar")
                    .font(WISETypography.body)
            }
            .foregroundColor(WISEColor.textSecondary)
        }
        .wisePanelStyle(highlighted: true)
    }

    // MARK: - System Status Gauges

    private var systemStatusSection: some View {
        VStack(alignment: .leading, spacing: WISESpacing.md) {
            Text("SYSTEM STATUS")
                .font(WISETypography.caption)
                .foregroundColor(WISEColor.textSecondary)

            HStack(spacing: WISESpacing.md) {
                gaugeSmall(value: "55°F", title: "SUPPLY AIR", accent: WISEColor.electricBlue)
                gaugeSmall(value: "72°F", title: "RETURN AIR", accent: WISEColor.wiseGreen)
            }

            HStack(spacing: WISESpacing.md) {
                gaugeSmall(value: "R-410A", title: "REFRIGERANT", accent: WISEColor.warningAmber)
                gaugeSmall(value: "COOL", title: "SYSTEM MODE", accent: WISEColor.wiseGreen)
            }
        }
    }

    private func gaugeSmall(value: String, title: String, accent: Color) -> some View {
        VStack(spacing: 8) {
            Text(value)
                .font(WISETypography.measurementSmall)
                .foregroundColor(accent)
                .monospacedDigit()

            Text(title)
                .font(WISETypography.captionSmall)
                .foregroundColor(WISEColor.textMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(WISESpacing.md)
        .background(WISEColor.surfacePrimary)
        .cornerRadius(WISECornerRadius.md)
        .overlay(
            RoundedRectangle(cornerRadius: WISECornerRadius.md)
                .stroke(accent.opacity(0.2), lineWidth: 0.5)
        )
    }

    // MARK: - Quick Actions

    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: WISESpacing.md) {
            Text("QUICK ACTIONS")
                .font(WISETypography.caption)
                .foregroundColor(WISEColor.textSecondary)

            VStack(spacing: WISESpacing.sm) {
                HStack(spacing: WISESpacing.sm) {
                    quickActionButton(title: "Meter Mode", icon: "waveform.circle.fill", color: WISEColor.electricBlue)
                    quickActionButton(title: "Refrigeration Analyzer", icon: "thermometer.snowflake", color: WISEColor.warningAmber)
                }

                HStack(spacing: WISESpacing.sm) {
                    quickActionButton(title: "Controls Lab", icon: "slider.horizontal.3", color: WISEColor.purple)
                    quickActionButton(title: "Trace Circuit", icon: "bolt.fill", color: WISEColor.wiseGreen)
                }

                HStack(spacing: WISESpacing.sm) {
                    quickActionButton(title: "Job Link", icon: "link.badge.checkmark", color: WISEColor.electricBlue)
                    quickActionButton(title: "Document", icon: "doc.text.fill", color: WISEColor.metalLight)
                }
            }
        }
    }

    private func quickActionButton(title: String, icon: String, color: Color) -> some View {
        Button(action: {}) {
            VStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 20, weight: .semibold))
                Text(title)
                    .font(WISETypography.captionSmall)
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .foregroundColor(color)
            .padding(WISESpacing.sm)
            .background(color.opacity(0.1))
            .cornerRadius(WISECornerRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: WISECornerRadius.md)
                    .stroke(color.opacity(0.25), lineWidth: 0.5)
            )
        }
    }

    // MARK: - IMP Tech Card

    private var impTechSection: some View {
        HStack(spacing: WISESpacing.md) {
            VStack(alignment: .leading, spacing: 6) {
                Text("IMP TECH")
                    .font(WISETypography.caption)
                    .foregroundColor(WISEColor.wiseGreen)

                Text("AI DIAGNOSTIC ASSISTANT")
                    .font(WISETypography.bodyLarge)
                    .foregroundColor(WISEColor.textPrimary)

                Text("Analyzing system data…\nI'm monitoring 12 live parameters.")
                    .font(WISETypography.body)
                    .foregroundColor(WISEColor.textSecondary)
                    .lineLimit(3)
            }

            Spacer()

            Image(systemName: "robot.fill")
                .font(.system(size: 48))
                .foregroundColor(WISEColor.wiseGreen.opacity(0.3))
        }
        .wisePanelStyle(highlighted: true)
    }
}

#Preview {
    DashboardView()
        .environmentObject(FieldTechViewModel())
}
