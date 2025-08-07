export interface VoiceCommandData {
  action: string;
  title?: string;
  description?: string;
  location?: string;
  date?: string;
  time?: string;
  duration?: string;
  isAllDay?: boolean;
  amount?: number;
  category?: string;
  confidence: number;
}

export interface ParsedTime {
  hours: number;
  minutes: number;
  period: "AM" | "PM";
}

export interface ParsedDate {
  day: number;
  month: number;
  year: number;
  relative?: "today" | "tomorrow" | "next_week";
}

class VoiceCommandProcessor {
  /**
   * Process voice input and extract structured data
   */
  processVoiceInput(text: string): VoiceCommandData {
    const lowerText = text.toLowerCase();
    const result: VoiceCommandData = {
      action: "unknown",
      confidence: 0.8,
    };

    // Determine the main action
    if (this.isEventCommand(lowerText)) {
      result.action = "create_event";
      this.extractEventData(text, result);
    } else if (this.isExpenseCommand(lowerText)) {
      result.action = "add_expense";
      this.extractExpenseData(text, result);
    } else if (this.isNavigationCommand(lowerText)) {
      result.action = "navigate";
      this.extractNavigationData(text, result);
    } else if (this.isQueryCommand(lowerText)) {
      result.action = "query";
      this.extractQueryData(text, result);
    }

    return result;
  }

  private isEventCommand(text: string): boolean {
    const eventKeywords = [
      "schedule",
      "meeting",
      "event",
      "appointment",
      "call",
      "title",
      "description",
      "location",
      "time",
      "date",
    ];
    return eventKeywords.some((keyword) => text.includes(keyword));
  }

  private isExpenseCommand(text: string): boolean {
    const expenseKeywords = [
      "expense",
      "cost",
      "spent",
      "paid",
      "amount",
      "dollar",
      "lunch",
      "dinner",
      "coffee",
      "transport",
      "gas",
    ];
    return expenseKeywords.some((keyword) => text.includes(keyword));
  }

  private isNavigationCommand(text: string): boolean {
    const navKeywords = [
      "show",
      "open",
      "go to",
      "navigate",
      "view",
      "display",
      "calendar",
      "expenses",
      "home",
      "profile",
    ];
    return navKeywords.some((keyword) => text.includes(keyword));
  }

  private isQueryCommand(text: string): boolean {
    const queryKeywords = [
      "what",
      "when",
      "where",
      "how",
      "why",
      "tell me",
      "show me",
      "find",
      "search",
    ];
    return queryKeywords.some((keyword) => text.includes(keyword));
  }

  private extractEventData(text: string, result: VoiceCommandData): void {
    // Extract title
    const titleMatch = text.match(
      /(?:title|event|meeting)\s+(.+?)(?:\s+(?:description|location|time|date|at)|$)/i
    );
    if (titleMatch) {
      result.title = titleMatch[1].trim();
    }

    // Extract description
    const descMatch = text.match(
      /(?:description|details|about)\s+(.+?)(?:\s+(?:location|time|date|at)|$)/i
    );
    if (descMatch) {
      result.description = descMatch[1].trim();
    }

    // Extract location
    const locationMatch = text.match(
      /(?:location|place|at|in)\s+(.+?)(?:\s+(?:time|date|on)|$)/i
    );
    if (locationMatch) {
      result.location = locationMatch[1].trim();
    }

    // Extract time
    const timeData = this.extractTime(text);
    if (timeData) {
      result.time = `${timeData.hours
        .toString()
        .padStart(2, "0")}:${timeData.minutes.toString().padStart(2, "0")} ${
        timeData.period
      }`;
    }

    // Extract date
    const dateData = this.extractDate(text);
    if (dateData) {
      if (dateData.relative) {
        result.date = dateData.relative;
      } else {
        result.date = `${dateData.month}/${dateData.day}/${dateData.year}`;
      }
    }

    // Check for all-day events
    if (
      text.toLowerCase().includes("all day") ||
      text.toLowerCase().includes("all-day")
    ) {
      result.isAllDay = true;
    }

    // Extract duration
    const durationMatch = text.match(/(\d+)\s*(?:hour|hr|minute|min)s?/i);
    if (durationMatch) {
      result.duration = durationMatch[0];
    }
  }

  private extractExpenseData(text: string, result: VoiceCommandData): void {
    // Extract amount
    const amountMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
    if (amountMatch) {
      result.amount = parseFloat(amountMatch[1]);
    }

    // Extract category
    const categories = [
      "lunch",
      "dinner",
      "coffee",
      "transport",
      "gas",
      "food",
      "entertainment",
    ];
    for (const category of categories) {
      if (text.toLowerCase().includes(category)) {
        result.category = category;
        break;
      }
    }

    // Extract description
    const descMatch = text.match(
      /(?:for|on|about)\s+(.+?)(?:\s+(?:amount|cost|dollar)|$)/i
    );
    if (descMatch) {
      result.description = descMatch[1].trim();
    }
  }

  private extractNavigationData(text: string, result: VoiceCommandData): void {
    if (text.toLowerCase().includes("calendar")) {
      result.action = "navigate_calendar";
    } else if (text.toLowerCase().includes("expense")) {
      result.action = "navigate_expenses";
    } else if (text.toLowerCase().includes("home")) {
      result.action = "navigate_home";
    } else if (text.toLowerCase().includes("profile")) {
      result.action = "navigate_profile";
    }
  }

  private extractQueryData(text: string, result: VoiceCommandData): void {
    result.description = text;
  }

  private extractTime(text: string): ParsedTime | null {
    // Match various time formats
    const timePatterns = [
      /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i,
      /(\d{1,2})\s*o'clock\s*(am|pm)/i,
      /at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i,
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        const hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const period = match[3].toUpperCase() as "AM" | "PM";

        return { hours, minutes, period };
      }
    }

    return null;
  }

  private extractDate(text: string): ParsedDate | null {
    const lowerText = text.toLowerCase();

    // Handle relative dates
    if (lowerText.includes("today")) {
      const today = new Date();
      return {
        day: today.getDate(),
        month: today.getMonth() + 1,
        year: today.getFullYear(),
        relative: "today",
      };
    }

    if (lowerText.includes("tomorrow")) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        day: tomorrow.getDate(),
        month: tomorrow.getMonth() + 1,
        year: tomorrow.getFullYear(),
        relative: "tomorrow",
      };
    }

    if (lowerText.includes("next week")) {
      return { day: 0, month: 0, year: 0, relative: "next_week" };
    }

    // Handle specific dates
    const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
    if (dateMatch) {
      const month = parseInt(dateMatch[1]);
      const day = parseInt(dateMatch[2]);
      const year = dateMatch[3]
        ? parseInt(dateMatch[3])
        : new Date().getFullYear();

      return { day, month, year };
    }

    return null;
  }

  /**
   * Generate a natural language response based on the processed command
   */
  generateResponse(commandData: VoiceCommandData): string {
    switch (commandData.action) {
      case "create_event":
        return this.generateEventResponse(commandData);
      case "add_expense":
        return this.generateExpenseResponse(commandData);
      case "navigate_calendar":
        return "Opening your calendar...";
      case "navigate_expenses":
        return "Opening expenses...";
      case "navigate_home":
        return "Going to home screen...";
      case "navigate_profile":
        return "Opening your profile...";
      default:
        return `I heard: "${
          commandData.description || "your command"
        }". How can I help you with that?`;
    }
  }

  private generateEventResponse(commandData: VoiceCommandData): string {
    let response = "Creating event";

    if (commandData.title) {
      response += `: ${commandData.title}`;
    }

    if (commandData.time) {
      response += ` at ${commandData.time}`;
    }

    if (commandData.date) {
      response += ` on ${commandData.date}`;
    }

    if (commandData.location) {
      response += ` in ${commandData.location}`;
    }

    return response + "...";
  }

  private generateExpenseResponse(commandData: VoiceCommandData): string {
    let response = "Adding expense";

    if (commandData.amount) {
      response += `: $${commandData.amount}`;
    }

    if (commandData.category) {
      response += ` for ${commandData.category}`;
    }

    if (commandData.description) {
      response += ` - ${commandData.description}`;
    }

    return response + "...";
  }
}

export const voiceCommandProcessor = new VoiceCommandProcessor();
export default voiceCommandProcessor;
