extends Window

# UI references
@onready var focus_spinbox: SpinBox = $VBoxContainer/TimerSettings/FocusDuration/FocusSpinBox
@onready var short_break_spinbox: SpinBox = $VBoxContainer/TimerSettings/ShortBreakDuration/ShortBreakSpinBox
@onready var long_break_spinbox: SpinBox = $VBoxContainer/TimerSettings/LongBreakDuration/LongBreakSpinBox
@onready var sound_toggle: CheckBox = $VBoxContainer/SoundSettings/SoundToggle
@onready var system_notification: CheckBox = $VBoxContainer/SoundSettings/SystemNotification
@onready var theme_option: OptionButton = $VBoxContainer/ThemeSettings/ThemeOption
@onready var reset_button: Button = $VBoxContainer/Buttons/ResetButton
@onready var cancel_button: Button = $VBoxContainer/Buttons/CancelButton
@onready var save_button: Button = $VBoxContainer/Buttons/SaveButton

# Settings data
var current_settings: Dictionary = {}
var original_settings: Dictionary = {}

# Signal to notify main scene of settings changes
signal settings_changed(settings: Dictionary)

func _ready():
	# Connect signals
	reset_button.pressed.connect(_on_reset_pressed)
	cancel_button.pressed.connect(_on_cancel_pressed)
	save_button.pressed.connect(_on_save_pressed)
	
	# Set up theme options
	theme_option.add_item("Dark Orange (Default)", 0)
	theme_option.add_item("Dark Blue", 1)
	theme_option.add_item("Dark Green", 2)
	
	# Load current settings
	_load_current_settings()
	
	# Store original settings for reset functionality
	original_settings = current_settings.duplicate()

func _load_current_settings():
	# Load settings from main scene or config file
	# For now, use default values
	current_settings = {
		"focus_duration": 25,
		"short_break_duration": 5,
		"long_break_duration": 15,
		"sound_enabled": true,
		"system_notifications": true,
		"theme": 0
	}
	
	# Update UI with current settings
	_update_ui_from_settings()

func _update_ui_from_settings():
	focus_spinbox.value = current_settings.focus_duration
	short_break_spinbox.value = current_settings.short_break_duration
	long_break_spinbox.value = current_settings.long_break_duration
	sound_toggle.button_pressed = current_settings.sound_enabled
	system_notification.button_pressed = current_settings.system_notifications
	theme_option.selected = current_settings.theme

func _on_reset_pressed():
	# Reset to original settings
	current_settings = original_settings.duplicate()
	_update_ui_from_settings()

func _on_cancel_pressed():
	# Restore original settings and close
	current_settings = original_settings.duplicate()
	_update_ui_from_settings()
	hide()

func _on_save_pressed():
	# Collect current UI values
	current_settings.focus_duration = int(focus_spinbox.value)
	current_settings.short_break_duration = int(short_break_spinbox.value)
	current_settings.long_break_duration = int(long_break_spinbox.value)
	current_settings.sound_enabled = sound_toggle.button_pressed
	current_settings.system_notifications = system_notification.button_pressed
	current_settings.theme = theme_option.selected
	
	# Save settings
	_save_settings()
	
	# Emit signal to notify main scene
	settings_changed.emit(current_settings)
	
	# Close dialog
	hide()

func _save_settings():
	# TODO: Save to config file
	# For now, just print to console
	print("Settings saved: ", current_settings)

func get_settings() -> Dictionary:
	return current_settings

func set_settings(settings: Dictionary):
	current_settings = settings.duplicate()
	original_settings = settings.duplicate()
	_update_ui_from_settings()

func show_settings():
	# Show the window and center it
	show()
	# Center the window on screen
	var screen_size = DisplayServer.screen_get_size()
	var window_size = size
	position = (screen_size - window_size) / 2
