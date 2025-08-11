extends Control

# Timer states
enum TimerState { IDLE, RUNNING, PAUSED, BREAK, LONG_BREAK }

# Timer durations (in seconds)
const FOCUS_DURATION = 25 * 60  # 25 minutes
const SHORT_BREAK_DURATION = 5 * 60  # 5 minutes
const LONG_BREAK_DURATION = 15 * 60  # 15 minutes

# Current state
var current_state: TimerState = TimerState.IDLE
var time_remaining: int = FOCUS_DURATION
var total_time: int = FOCUS_DURATION
var is_paused: bool = false
var completed_pomodoros: int = 0

# UI references
@onready var time_label: Label = $VBoxContainer/TimerDisplay/TimeLabel
@onready var phase_label: Label = $VBoxContainer/TimerDisplay/PhaseLabel
@onready var progress_bar: ProgressBar = $VBoxContainer/TimerDisplay/ProgressBar
@onready var start_button: Button = $VBoxContainer/Controls/StartButton
@onready var pause_button: Button = $VBoxContainer/Controls/PauseButton
@onready var reset_button: Button = $VBoxContainer/Controls/ResetButton
@onready var task_input: LineEdit = $VBoxContainer/TaskSection/TaskInput
@onready var settings_button: Button = $VBoxContainer/SettingsButton
@onready var timer: Timer = $Timer
@onready var notification_sound: AudioStreamPlayer = $NotificationSound

# Settings
var settings: Dictionary = {
	"sound_enabled": true,
	"focus_duration": FOCUS_DURATION,
	"short_break_duration": SHORT_BREAK_DURATION,
	"long_break_duration": LONG_BREAK_DURATION
}

func _ready():
	# Connect signals
	start_button.pressed.connect(_on_start_pressed)
	pause_button.pressed.connect(_on_pause_pressed)
	reset_button.pressed.connect(_on_reset_pressed)
	settings_button.pressed.connect(_on_settings_pressed)
	timer.timeout.connect(_on_timer_timeout)
	
	# Set up timer
	timer.wait_time = 1.0
	
	# Load settings
	_load_settings()
	
	# Initialize UI
	_update_ui()
	_update_button_states()

func _on_start_pressed():
	if current_state == TimerState.IDLE or current_state == TimerState.PAUSED:
		_start_timer()
	elif current_state == TimerState.RUNNING:
		_pause_timer()

func _on_pause_pressed():
	if current_state == TimerState.RUNNING:
		_pause_timer()

func _on_reset_pressed():
	_reset_timer()

func _on_settings_pressed():
	# Open settings dialog
	if not has_node("SettingsDialog"):
		var settings_dialog = preload("res://scenes/SettingsDialog.tscn").instantiate()
		add_child(settings_dialog)
		settings_dialog.settings_changed.connect(_on_settings_changed)
		settings_dialog.set_settings(settings)
	
	$SettingsDialog.show_settings()

func _start_timer():
	if current_state == TimerState.IDLE:
		# Starting fresh
		current_state = TimerState.RUNNING
		time_remaining = settings.focus_duration
		total_time = settings.focus_duration
		phase_label.text = "Focus Time"
	elif current_state == TimerState.PAUSED:
		# Resuming from pause
		current_state = TimerState.RUNNING
		phase_label.text = "Focus Time"
	
	timer.start()
	_update_button_states()
	_update_ui()

func _pause_timer():
	if current_state == TimerState.RUNNING:
		current_state = TimerState.PAUSED
		timer.stop()
		_update_button_states()
		_update_ui()

func _reset_timer():
	current_state = TimerState.IDLE
	time_remaining = settings.focus_duration
	total_time = settings.focus_duration
	timer.stop()
	phase_label.text = "Focus Time"
	_update_button_states()
	_update_ui()

func _on_timer_timeout():
	time_remaining -= 1
	
	if time_remaining <= 0:
		_timer_completed()
	else:
		_update_ui()

func _timer_completed():
	timer.stop()
	
	if current_state == TimerState.RUNNING:
		# Focus session completed
		completed_pomodoros += 1
		
		if completed_pomodoros % 4 == 0:
			# Long break after 4 pomodoros
			_start_break(settings.long_break_duration, "Long Break")
		else:
			# Short break
			_start_break(settings.short_break_duration, "Short Break")
		
		# Play notification sound
		if settings.sound_enabled:
			_play_notification()
		
		# Show notification
		_show_notification()

func _start_break(duration: int, break_type: String):
	current_state = TimerState.BREAK
	time_remaining = duration
	total_time = duration
	phase_label.text = break_type
	timer.start()
	_update_button_states()
	_update_ui()

func _play_notification():
	# TODO: Add actual sound file
	# For now, just print to console
	print("Timer completed! Play notification sound.")

func _show_notification():
	# TODO: Implement system notification
	print("Timer completed! Show system notification.")

func _update_ui():
	# Update time display
	var minutes = time_remaining / 60
	var seconds = time_remaining % 60
	time_label.text = "%02d:%02d" % [minutes, seconds]
	
	# Update progress bar
	if total_time > 0:
		var progress = float(time_remaining) / float(total_time)
		progress_bar.value = progress * 100

func _update_button_states():
	match current_state:
		TimerState.IDLE:
			start_button.text = "Start"
			start_button.disabled = false
			pause_button.disabled = true
			reset_button.disabled = false
		TimerState.RUNNING:
			start_button.text = "Pause"
			start_button.disabled = false
			pause_button.disabled = false
			reset_button.disabled = false
		TimerState.PAUSED:
			start_button.text = "Resume"
			start_button.disabled = false
			pause_button.disabled = true
			reset_button.disabled = false
		TimerState.BREAK:
			start_button.text = "Skip Break"
			start_button.disabled = false
			pause_button.disabled = true
			reset_button.disabled = false

func _load_settings():
	# Load settings from file or use defaults
	# For now, use defaults
	settings = {
		"sound_enabled": true,
		"focus_duration": FOCUS_DURATION,
		"short_break_duration": SHORT_BREAK_DURATION,
		"long_break_duration": LONG_BREAK_DURATION,
		"system_notifications": true,
		"theme": 0
	}
	
	# Update timer durations
	time_remaining = settings.focus_duration
	total_time = settings.focus_duration

func _on_settings_changed(new_settings: Dictionary):
	# Update current settings
	settings = new_settings.duplicate()
	
	# Update timer durations if timer is not running
	if current_state == TimerState.IDLE:
		time_remaining = settings.focus_duration
		total_time = settings.focus_duration
		_update_ui()
	
	# Save settings
	_save_settings()

func _save_settings():
	# TODO: Save settings to file
	pass

# Handle window close
func _notification(what):
	if what == NOTIFICATION_WM_CLOSE_REQUEST:
		_save_settings()
		get_tree().quit()
