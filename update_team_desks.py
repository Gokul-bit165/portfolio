import re

team_path = "c:\\Users\\gokul\\portfolio-team\\team.html"

with open(team_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Insert spiral binder overlay
spiral_overlay = """  <main class="page-content">

    <!-- Spiral Metal Binder Rings Overlay -->
    <div class="spiral-binder">
      <div class="spiral-loop"></div>
      <div class="spiral-loop"></div>
      <div class="spiral-loop"></div>
      <div class="spiral-loop"></div>
      <div class="spiral-loop"></div>
      <div class="spiral-loop"></div>
      <div class="spiral-loop"></div>
      <div class="spiral-loop"></div>
      <div class="spiral-loop"></div>
      <div class="spiral-loop"></div>
      <div class="spiral-loop"></div>
      <div class="spiral-loop"></div>
    </div>"""

html = html.replace('  <main class="page-content">', spiral_overlay)

# 2. Replace the team card grid content
grid_regex = r'<div class="team-grid">.*?</div>\s*<!-- ======================== TIMELINE ======================= -->'

new_grid = """<div class="team-grid">

      <!-- Workstation 1: Gokul -->
      <div class="workstation-desk">
        <div style="display:flex; flex-direction:column; gap:10px;">
          <div class="desk-photo" style="background-image:url('assets/robot_skectch/robot_lookup-nb.png');">
            <div class="masking-tape masking-tape--top"></div>
          </div>
          <div class="font-display" style="font-size:22px; margin-top:4px;">Gokul</div>
          <div class="font-mono" style="font-size:11px; color:var(--color-gray);">DEV LEAD // SYSTEM</div>
        </div>

        <div class="desk-console">
          <div class="console-header">[GOKUL-DESK] - STABLE COMPILER</div>
          <div class="console-body">
            <div>&gt; cargo build --release --bin compiler</div>
            <div style="color:#A3E635;">[OK] lexer pass: 1024 symbols parsed</div>
            <div style="color:#A3E635;">[OK] AST optimizer node initialized</div>
            <div style="color:#A3E635;">[OK] WebAssembly binary generated (14.2KB)</div>
            <div style="margin-top:10px; color:#F59E0B;">&gt; runtime metrics: execution latency 1.4ms</div>
            <div style="color:#60A5FA;">&gt; telemetry channel: active</div>
          </div>
        </div>

        <div class="desk-attachments">
          <div class="sticky-note sticky-note--orange" style="position:static; width:100%; height:auto; transform:rotate(-1deg);">
            <div class="font-script" style="font-size:14px;">"Don't change parser structure before fixing stack allocation issue!" -- Sam</div>
          </div>
          <div class="font-mono" style="font-size:10px; border:1px dashed var(--color-black); padding:6px; background:#FAF9F6;">
            LANG: Rust / C++ / WebAssembly<br>
            STATUS: Shipping
          </div>
        </div>
      </div>

      <!-- Workstation 2: Aria -->
      <div class="workstation-desk">
        <div style="display:flex; flex-direction:column; gap:10px;">
          <div class="desk-photo" style="background-image:url('assets/robot_skectch/robot_sayhi-nb.png');">
            <div class="masking-tape masking-tape--top"></div>
          </div>
          <div class="font-display" style="font-size:22px; margin-top:4px;">Aria</div>
          <div class="font-mono" style="font-size:11px; color:var(--color-gray);">AI ARCHITECT // AGENTS</div>
        </div>

        <div class="desk-console">
          <div class="console-header">[ARIA-DESK] - LANGGRAPH ENGINE</div>
          <div class="console-body">
            <div>&gt; python run_agent_workflow.py</div>
            <div style="color:#A3E635;">[OK] model instance warm: fastgpt-1.5-turbo</div>
            <div style="color:#A3E635;">[OK] LangGraph state dynamic routing complete</div>
            <div style="color:#A3E635;">[OK] query resolved in 340ms</div>
            <div style="margin-top:10px; color:#F59E0B;">&gt; current experiment: fine-tuning token efficiency</div>
            <div style="color:#60A5FA;">&gt; telemetry channel: active</div>
          </div>
        </div>

        <div class="desk-attachments">
          <div class="sticky-note sticky-note--lilac" style="position:static; width:100%; height:auto; transform:rotate(2deg);">
            <div class="font-script" style="font-size:14px;">"Running test suite on context window limits. Looks good." -- Aria</div>
          </div>
          <div class="font-mono" style="font-size:10px; border:1px dashed var(--color-black); padding:6px; background:#FAF9F6;">
            LANG: Python / LangGraph / PyTorch<br>
            STATUS: Debugging Nodes
          </div>
        </div>
      </div>

      <!-- Workstation 3: Sam -->
      <div class="workstation-desk">
        <div style="display:flex; flex-direction:column; gap:10px;">
          <div class="desk-photo" style="background-image:url('assets/robot_skectch/robot_frontview-nb.png');">
            <div class="masking-tape masking-tape--top"></div>
          </div>
          <div class="font-display" style="font-size:22px; margin-top:4px;">Sam</div>
          <div class="font-mono" style="font-size:11px; color:var(--color-gray);">ROBOTICS // ROS2 CONTROL</div>
        </div>

        <div class="desk-console">
          <div class="console-header">[SAM-DESK] - ROS2 RUNTIME</div>
          <div class="console-body">
            <div>&gt; ros2 launch flight_swarm swarm_bringup.launch.py</div>
            <div style="color:#A3E635;">[OK] node connection UAV_1 to UAV_6 active</div>
            <div style="color:#A3E635;">[OK] flight controller state sync protocol loaded</div>
            <div style="color:#A3E635;">[OK] collision bubble safe: limit 1.2m</div>
            <div style="margin-top:10px; color:#F59E0B;">&gt; telemetry metrics: coordination jitter &lt; 2ms</div>
            <div style="color:#60A5FA;">&gt; hardware state: ready</div>
          </div>
        </div>

        <div class="desk-attachments">
          <div class="sticky-note sticky-note--green" style="position:static; width:100%; height:auto; transform:rotate(-2deg);">
            <div class="font-script" style="font-size:14px;">"Swarms tested in park sector 3. 99% sync benchmark met!" -- Sam</div>
          </div>
          <div class="font-mono" style="font-size:10px; border:1px dashed var(--color-black); padding:6px; background:#FAF9F6;">
            LANG: C++ / ROS2 / Python<br>
            STATUS: Field Testing
          </div>
        </div>
      </div>

    </div>

    <!-- ======================== TIMELINE ======================= -->"""

html = re.sub(grid_regex, new_grid, html, flags=re.DOTALL)

with open(team_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("team.html workstations update complete.")
