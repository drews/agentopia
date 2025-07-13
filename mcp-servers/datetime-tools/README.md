# DateTime Tools MCP Server

A simple offline MCP server that provides basic datetime semantics and calendar calculations.

## Features

- **Date Calculations**: Days between dates, days until future dates
- **Holiday Information**: Built-in knowledge of common holidays
- **Calendar Operations**: Day of week, month info, leap year checks
- **Time Formatting**: Multiple date/time formats
- **Timezone Support**: Basic timezone operations
- **No Internet Required**: Fully offline operation

## Tools Provided

### Date Calculations
- `days_until(date)` - "How many days until Christmas?"
- `days_between(start_date, end_date)` - Calculate duration between dates
- `add_days(date, days)` - Add/subtract days from a date

### Calendar Information
- `day_of_week(date)` - What day of the week is a date?
- `is_weekend(date)` - Is this date a weekend?
- `is_leap_year(year)` - Is this a leap year?
- `days_in_month(year, month)` - How many days in this month?

### Holiday/Event Detection
- `is_holiday(date)` - Is this date a major holiday?
- `next_holiday()` - When is the next holiday?
- `holidays_in_year(year)` - List all holidays in a year

### Time Utilities
- `current_time()` - Get current date/time
- `format_date(date, format)` - Format dates in different ways
- `parse_date(date_string)` - Parse natural language dates

## Installation

```bash
# Clone and install
git clone <this-repo>
cd datetime-tools
pip install -e .

# Run the server
python -m datetime_tools.server
```

## Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "datetime-tools": {
      "command": "python",
      "args": ["-m", "datetime_tools.server"],
      "env": {
        "TIMEZONE": "America/New_York"
      }
    }
  }
}
```

## Example Usage

- "How many days until Christmas?" → `days_until("2024-12-25")`
- "What day of the week is New Year's Day?" → `day_of_week("2025-01-01")`
- "Is 2024 a leap year?" → `is_leap_year(2024)`
- "When is the next holiday?" → `next_holiday()`