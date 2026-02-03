package mqtt

import (
	"encoding/json"
	"fmt"
)

// SchedulePublisher handles publishing schedule commands to devices via MQTT
type SchedulePublisher struct {
	client *Client
}

// NewSchedulePublisher creates a new SchedulePublisher
func NewSchedulePublisher(client *Client) *SchedulePublisher {
	return &SchedulePublisher{
		client: client,
	}
}

// ScheduleCommand represents the schedule command sent to ems_vrv
// Matches the format expected by ems_vrv MQTT handler
type ScheduleCommand struct {
	Command    string                `json:"command"` // "schedule"
	Data       map[string]*DailyRule `json:"data"`    // Keyed by day name (Monday-Sunday)
	Exceptions []string              `json:"exceptions,omitempty"`
}

// DailyRule represents a single day's schedule rule
type DailyRule struct {
	RunPeriod *TimePeriod `json:"runPeriod,omitempty"`
	Actions   []*Action   `json:"actions,omitempty"`
}

// TimePeriod represents a time period for running
type TimePeriod struct {
	Start string `json:"start"` // HH:MM format
	End   string `json:"end"`   // HH:MM format
}

// Action represents a scheduled action
type Action struct {
	Type string `json:"type"` // closeOnce, skip, forceCloseAfter
	Time string `json:"time,omitempty"`
}

// DeviceInfoCommand represents a device info query command
type DeviceInfoCommand struct {
	Command string `json:"command"` // "deviceInfo"
}

// GetScheduleCommand represents a get schedule query command
type GetScheduleCommand struct {
	Command string `json:"command"` // "getSchedule"
}

// GetCommandTopic returns the MQTT topic for sending commands to a device
func GetCommandTopic(deviceSN string) string {
	return fmt.Sprintf("ac/command/%s", deviceSN)
}

// GetReturnTopic returns the MQTT topic for receiving responses from a device
func GetReturnTopic(deviceSN string) string {
	return fmt.Sprintf("ac/return/%s", deviceSN)
}

// GetReturnTopicWildcard returns the wildcard topic for subscribing to all device responses
func GetReturnTopicWildcard() string {
	return "ac/return/+"
}

// PublishSchedule sends a schedule command to a device
func (p *SchedulePublisher) PublishSchedule(deviceSN string, cmd *ScheduleCommand) error {
	if p.client == nil {
		return fmt.Errorf("MQTT client is not initialized")
	}

	// Ensure command is set
	if cmd.Command == "" {
		cmd.Command = "schedule"
	}

	payload, err := json.Marshal(cmd)
	if err != nil {
		return fmt.Errorf("failed to marshal schedule command: %w", err)
	}

	topic := GetCommandTopic(deviceSN)
	return p.client.Publish(topic, 1, false, payload) // QoS 1 for at-least-once delivery
}

// PublishDeviceInfoRequest sends a device info query command
func (p *SchedulePublisher) PublishDeviceInfoRequest(deviceSN string) error {
	if p.client == nil {
		return fmt.Errorf("MQTT client is not initialized")
	}

	cmd := &DeviceInfoCommand{
		Command: "deviceInfo",
	}

	payload, err := json.Marshal(cmd)
	if err != nil {
		return fmt.Errorf("failed to marshal deviceInfo command: %w", err)
	}

	topic := GetCommandTopic(deviceSN)
	return p.client.Publish(topic, 1, false, payload)
}

// PublishGetScheduleRequest sends a getSchedule query command to retrieve schedule from device
func (p *SchedulePublisher) PublishGetScheduleRequest(deviceSN string) error {
	if p.client == nil {
		return fmt.Errorf("MQTT client is not initialized")
	}

	cmd := &GetScheduleCommand{
		Command: "getSchedule",
	}

	payload, err := json.Marshal(cmd)
	if err != nil {
		return fmt.Errorf("failed to marshal getSchedule command: %w", err)
	}

	topic := GetCommandTopic(deviceSN)
	return p.client.Publish(topic, 1, false, payload)
}

// ConvertToMQTTSchedule converts internal schedule data to MQTT command format
func ConvertToMQTTSchedule(dailyRules map[string]interface{}, exceptions []string) *ScheduleCommand {
	cmd := &ScheduleCommand{
		Command:    "schedule",
		Data:       make(map[string]*DailyRule),
		Exceptions: exceptions,
	}

	for day, rule := range dailyRules {
		if rule == nil {
			cmd.Data[day] = nil
			continue
		}

		ruleMap, ok := rule.(map[string]interface{})
		if !ok {
			continue
		}

		dailyRule := &DailyRule{}

		// Convert run period
		if runPeriod, ok := ruleMap["runPeriod"].(map[string]interface{}); ok {
			dailyRule.RunPeriod = &TimePeriod{
				Start: getStringValue(runPeriod, "start"),
				End:   getStringValue(runPeriod, "end"),
			}
		}

		// Convert actions
		if actions, ok := ruleMap["actions"].([]interface{}); ok {
			for _, a := range actions {
				if actionMap, ok := a.(map[string]interface{}); ok {
					action := &Action{
						Type: getStringValue(actionMap, "type"),
						Time: getStringValue(actionMap, "time"),
					}
					dailyRule.Actions = append(dailyRule.Actions, action)
				}
			}
		}

		cmd.Data[day] = dailyRule
	}

	return cmd
}

// getStringValue safely extracts a string value from a map
func getStringValue(m map[string]interface{}, key string) string {
	if v, ok := m[key]; ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}
