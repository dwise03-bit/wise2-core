import SwiftUI

struct SenCereAddScreen: View {
  @State private var selectedOption = 0
  let options = ["New Project", "New Quote", "New Order"]

  var body: some View {
    NavigationStack {
      VStack(spacing: 0) {
        // Header
        VStack(alignment: .leading, spacing: 8) {
          Text("Create New")
            .font(.title2)
            .fontWeight(.bold)
            .foregroundColor(.white)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)

        // Picker
        Picker("Option", selection: $selectedOption) {
          ForEach(0..<options.count, id: \.self) { index in
            Text(options[index]).tag(index)
          }
        }
        .pickerStyle(.segmented)
        .tint(.sencereGold)
        .padding(16)

        ScrollView {
          VStack(spacing: 12) {
            switch selectedOption {
            case 0:
              NewProjectForm()
            case 1:
              NewQuoteForm()
            case 2:
              NewOrderForm()
            default:
              NewProjectForm()
            }
          }
          .padding(16)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
      }
      .background(Color.black)
    }
  }
}

struct NewProjectForm: View {
  @State private var projectName = ""
  @State private var description = ""
  @State private var dueDate = Date().addingTimeInterval(30*24*3600)

  var body: some View {
    VStack(spacing: 16) {
      FormField(
        label: "Project Name",
        placeholder: "Enter project name",
        text: $projectName
      )

      FormField(
        label: "Description",
        placeholder: "Describe your project",
        text: $description
      )

      VStack(alignment: .leading, spacing: 8) {
        Text("Due Date")
          .font(.subheadline)
          .fontWeight(.semibold)
          .foregroundColor(.white)
        DatePicker(
          "Select date",
          selection: $dueDate,
          displayedComponents: .date
        )
        .datePickerStyle(.graphical)
        .tint(.sencereGold)
      }
      .padding(12)
      .background(Color.white.opacity(0.05))
      .cornerRadius(8)

      Button(action: {}) {
        Text("Create Project")
          .frame(maxWidth: .infinity)
          .padding(14)
          .background(Color.sencereGold)
          .foregroundColor(.black)
          .fontWeight(.bold)
          .cornerRadius(8)
      }
      .padding(.top, 20)
    }
  }
}

struct NewQuoteForm: View {
  @State private var customerName = ""
  @State private var customerEmail = ""
  @State private var itemDescription = ""
  @State private var quantity = "1"
  @State private var unitPrice = ""

  var body: some View {
    VStack(spacing: 16) {
      FormField(
        label: "Customer Name",
        placeholder: "Enter customer name",
        text: $customerName
      )

      FormField(
        label: "Customer Email",
        placeholder: "customer@example.com",
        text: $customerEmail
      )

      Divider()
        .background(Color.white.opacity(0.1))

      FormField(
        label: "Item Description",
        placeholder: "e.g., Custom Hoodies",
        text: $itemDescription
      )

      HStack(spacing: 12) {
        FormField(
          label: "Quantity",
          placeholder: "0",
          text: $quantity
        )

        FormField(
          label: "Unit Price",
          placeholder: "0.00",
          text: $unitPrice
        )
      }

      VStack(alignment: .leading, spacing: 8) {
        Text("Total")
          .font(.subheadline)
          .fontWeight(.semibold)
          .foregroundColor(.white)
        Text("$\(calculateTotal())")
          .font(.title3)
          .fontWeight(.bold)
          .foregroundColor(.sencereGold)
      }
      .padding(12)
      .background(Color.white.opacity(0.05))
      .cornerRadius(8)

      Button(action: {}) {
        Text("Send Quote")
          .frame(maxWidth: .infinity)
          .padding(14)
          .background(Color.sencereGold)
          .foregroundColor(.black)
          .fontWeight(.bold)
          .cornerRadius(8)
      }
      .padding(.top, 20)
    }
  }

  private func calculateTotal() -> String {
    guard let qty = Int(quantity), let price = Double(unitPrice) else {
      return "0.00"
    }
    let total = Double(qty) * price
    return String(format: "%.2f", total)
  }
}

struct NewOrderForm: View {
  @State private var orderName = ""
  @State private var quantity = ""
  @State private var projectId = ""
  @State private var notes = ""

  var body: some View {
    VStack(spacing: 16) {
      FormField(
        label: "Order Name",
        placeholder: "e.g., Team Hoodie Order",
        text: $orderName
      )

      FormField(
        label: "Quantity",
        placeholder: "0",
        text: $quantity
      )

      FormField(
        label: "Project ID (optional)",
        placeholder: "Link to existing project",
        text: $projectId
      )

      VStack(alignment: .leading, spacing: 8) {
        Text("Notes")
          .font(.subheadline)
          .fontWeight(.semibold)
          .foregroundColor(.white)
        TextEditor(text: $notes)
          .font(.body)
          .foregroundColor(.white)
          .frame(height: 100)
          .padding(8)
          .background(Color.white.opacity(0.05))
          .cornerRadius(8)
      }

      Button(action: {}) {
        Text("Create Order")
          .frame(maxWidth: .infinity)
          .padding(14)
          .background(Color.sencereGold)
          .foregroundColor(.black)
          .fontWeight(.bold)
          .cornerRadius(8)
      }
      .padding(.top, 20)
    }
  }
}

struct FormField: View {
  let label: String
  let placeholder: String
  @Binding var text: String

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(label)
        .font(.subheadline)
        .fontWeight(.semibold)
        .foregroundColor(.white)
      TextField(placeholder, text: $text)
        .font(.body)
        .foregroundColor(.white)
        .padding(12)
        .background(Color.white.opacity(0.05))
        .cornerRadius(8)
    }
  }
}

#Preview {
  SenCereAddScreen()
    .preferredColorScheme(.dark)
}
