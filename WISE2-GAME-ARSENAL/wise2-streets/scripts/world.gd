extends Node3D

const WALK_SPEED := 7.0
const DRIVE_ACCEL := 22.0
const DRIVE_DRAG := 7.0
const MAX_DRIVE_SPEED := 26.0
const TURN_SPEED := 1.9
var avatar: CharacterBody3D
var car: CharacterBody3D
var camera: Camera3D
var status: Label
var driving := false
var car_speed := 0.0
var car_heading := 0.0
var look_heading := 0.0
var touch_axes := Vector2.ZERO
var touch_action := false
var touch_brake := false

func _ready() -> void:
 _build_world()
 _build_hud()
 _build_touch_controls()
 _update_status()

func _mesh_box(parent: Node3D, name: String, size: Vector3, color: Color, pos: Vector3) -> MeshInstance3D:
 var m := MeshInstance3D.new()
 m.name = name
 var mesh := BoxMesh.new()
 mesh.size = size
 m.mesh = mesh
 var mat := StandardMaterial3D.new()
 mat.albedo_color = color
 m.material_override = mat
 m.position = pos
 parent.add_child(m)
 return m

func _body(name: String, position3d: Vector3, size: Vector3, color: Color) -> CharacterBody3D:
 var body := CharacterBody3D.new()
 body.name = name
 body.position = position3d
 add_child(body)
 _mesh_box(body, "Visual", size, color, Vector3.ZERO)
 var shape := CollisionShape3D.new()
 var box := BoxShape3D.new()
 box.size = size
 shape.shape = box
 body.add_child(shape)
 return body

func _build_world() -> void:
 var environment := WorldEnvironment.new()
 var env := Environment.new()
 env.background_mode = Environment.BG_COLOR
 env.background_color = Color("89b7d8")
 env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
 env.ambient_light_color = Color("ffffff")
 env.ambient_light_energy = 0.75
 environment.environment = env
 add_child(environment)
 var sun := DirectionalLight3D.new()
 sun.rotation_degrees = Vector3(-55, -30, 0)
 sun.light_energy = 1.4
 add_child(sun)
 _mesh_box(self, "Ground", Vector3(260, 0.2, 260), Color("387353"), Vector3(0, -0.15, 0))
 for i in range(-2, 3):
  var p := float(i) * 35.0
  _mesh_box(self, "Road_NS", Vector3(11, 0.03, 260), Color("263344"), Vector3(p, 0.0, 0))
  _mesh_box(self, "Road_EW", Vector3(260, 0.04, 11), Color("263344"), Vector3(0, 0.01, p))
  for j in range(-12, 13):
   _mesh_box(self, "LaneMark", Vector3(0.2, 0.06, 3), Color("edc957"), Vector3(p, 0.04, j * 10.0))
   _mesh_box(self, "LaneMark", Vector3(3, 0.06, 0.2), Color("edc957"), Vector3(j * 10.0, 0.05, p))
 for x in range(-2, 2):
  for z in range(-2, 2):
   var center := Vector3(x * 35.0 + 17.5, 0, z * 35.0 + 17.5)
   var height := float(8 + ((x + 3) * 7 + (z + 3) * 11) % 17)
   _mesh_box(self, "Building", Vector3(15, height, 15), Color.from_hsv(float((x + 3) * 3 + (z + 3)) / 24.0, 0.3, 0.75), center + Vector3(0, height / 2.0, 0))
 avatar = _body("Player", Vector3(2, 1, 8), Vector3(0.8, 2, 0.8), Color("198bff"))
 car = _body("Vehicle", Vector3(0, 0.8, 0), Vector3(2.2, 1.5, 4.2), Color("e73b51"))
 for x in [-0.85, 0.85]:
  for z in [-1.35, 1.35]:
   _mesh_box(car, "Wheel", Vector3(0.35, 0.8, 0.8), Color("151c29"), Vector3(x * 1.35, -0.45, z))
 camera = Camera3D.new()
 camera.current = true
 add_child(camera)

func _build_hud() -> void:
 var layer := CanvasLayer.new()
 add_child(layer)
 var panel := Control.new()
 panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
 layer.add_child(panel)
 status = Label.new()
 status.position = Vector2(24, 18)
 status.add_theme_font_size_override("font_size", 23)
 panel.add_child(status)
 var hint := Label.new()
 hint.text = "WASD / Left stick: move or drive    E / A: enter or exit    Space / B: brake"
 hint.position = Vector2(24, 55)
 panel.add_child(hint)

func _touch_button(parent: Control, text_value: String, pos: Vector2, action: String) -> void:
 var b := Button.new()
 b.text = text_value
 b.position = pos
 b.custom_minimum_size = Vector2(82, 70)
 parent.add_child(b)
 b.button_down.connect(func(): _touch_press(action, true))
 b.button_up.connect(func(): _touch_press(action, false))

func _touch_press(action: String, pressed: bool) -> void:
 if action == "interact":
  if pressed: touch_action = true
 elif action == "brake":
  touch_brake = pressed
 elif action == "up":
  touch_axes.y = -1.0 if pressed else 0.0
 elif action == "down":
  touch_axes.y = 1.0 if pressed else 0.0
 elif action == "left":
  touch_axes.x = -1.0 if pressed else 0.0
 elif action == "right":
  touch_axes.x = 1.0 if pressed else 0.0

func _build_touch_controls() -> void:
 var layer := CanvasLayer.new()
 add_child(layer)
 var controls := Control.new()
 controls.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 controls.mouse_filter = Control.MOUSE_FILTER_IGNORE
 layer.add_child(controls)
 _touch_button(controls, "↑", Vector2(95, 525), "up")
 _touch_button(controls, "↓", Vector2(95, 610), "down")
 _touch_button(controls, "←", Vector2(10, 610), "left")
 _touch_button(controls, "→", Vector2(180, 610), "right")
 _touch_button(controls, "ENTER", Vector2(1080, 525), "interact")
 _touch_button(controls, "BRAKE", Vector2(1080, 610), "brake")

func _physics_process(delta: float) -> void:
 var axes := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
 if touch_axes.length() > 0.01:
  axes = touch_axes
 if Input.is_action_just_pressed("interact") or touch_action:
  touch_action = false
  if driving:
   driving = false
   avatar.position = car.position + car.global_basis.x * 3.0 + Vector3(0, 0.2, 0)
   avatar.visible = true
  elif avatar.position.distance_to(car.position) < 5.0:
   driving = true
   avatar.visible = false
  _update_status()
 if driving:
  var throttle := -axes.y
  car_speed = move_toward(car_speed, throttle * MAX_DRIVE_SPEED, (DRIVE_ACCEL if absf(throttle) > 0.05 else DRIVE_DRAG) * delta)
  if Input.is_action_pressed("brake") or touch_brake:
   car_speed = move_toward(car_speed, 0.0, DRIVE_ACCEL * 2.5 * delta)
  car_heading += -axes.x * TURN_SPEED * delta * clampf(absf(car_speed) / 10.0, 0, 1) * signf(car_speed)
  car.rotation.y = car_heading
  car.velocity = -car.global_basis.z * car_speed
  car.move_and_slide()
 else:
  avatar.velocity = Vector3(axes.x, 0, axes.y) * WALK_SPEED
  avatar.move_and_slide()
 var target := car.position if driving else avatar.position
 var desired := target + Vector3(0, 8 if driving else 5, 13 if driving else 9)
 camera.global_position = camera.global_position.lerp(desired, minf(1, delta * 5.0))
 camera.look_at(target + Vector3.UP, Vector3.UP)
 if driving:
  status.text = "WISE² STREETS | DRIVING | %d km/h" % int(absf(car_speed) * 3.6)

func _update_status() -> void:
 status.text = "WISE² STREETS | " + ("DRIVING" if driving else "ON FOOT — approach red car")
