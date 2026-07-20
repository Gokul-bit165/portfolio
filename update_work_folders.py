import re

work_path = "c:\\Users\\gokul\\portfolio-team\\work.html"

with open(work_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Insert spiral binder overlay at the start of page-content
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

# 2. Extract and replace the project-grid contents completely
grid_regex = r'<div class="project-grid">.*?</div>\s*</main>'

new_grid = """<div class="project-grid">

      <!-- Folder 1: AeroTwin -->
      <div class="project-card" onclick="location.href='project-detail.html'">
        <div class="project-card__blueprint">
          <div class="font-mono" style="font-size:10px; opacity:0.8;">ARCH // FLOW</div>
          <div class="font-display" style="font-size:13px; margin: 4px 0; color:#93C5FD;">STATE_SYNCHRONIZER</div>
          <div class="font-mono" style="font-size:9px; color:#60A5FA;">[RUST_ENGINE_v1.2]</div>
        </div>
        <div class="project-card__metrics">
          <div class="font-mono" style="font-size:9px; color:var(--color-gray);">LATENCY PROTOCOL</div>
          <div class="font-display" style="font-size:16px; color:var(--accent-orange);">99.9% sync</div>
          <div class="font-mono" style="font-size:9px;">BENCHMARK: SUB-50MS</div>
        </div>
        <div class="project-card__cover">
          <div>
            <div class="font-mono" style="font-size:9px; color:var(--color-gray);">UAV SWARMS</div>
            <div class="font-display" style="font-size:22px; line-height:1.1; margin-top:4px;">AeroTwin Swarm</div>
          </div>
          <div>
            <div class="font-script" style="font-size:15px; color:var(--color-black); margin-bottom:8px; opacity:0.8;">Decentralized flight controller for autonomous UAV swarms.</div>
            <div class="project-card__tags">
              <span class="project-card__tag">Rust</span>
              <span class="project-card__tag">ROS2</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Folder 2: MuleNet -->
      <div class="project-card" onclick="location.href='project-detail.html'">
        <div class="project-card__blueprint">
          <div class="font-mono" style="font-size:10px; opacity:0.8;">SPEC // FLOW</div>
          <div class="font-display" style="font-size:13px; margin: 4px 0; color:#93C5FD;">P2P_MESH_BLE</div>
          <div class="font-mono" style="font-size:9px; color:#60A5FA;">[GO_PROTOCOL_v0.9]</div>
        </div>
        <div class="project-card__metrics">
          <div class="font-mono" style="font-size:9px; color:var(--color-gray);">ROUTING DECAY</div>
          <div class="font-display" style="font-size:16px; color:var(--accent-orange);">100% off-grid</div>
          <div class="font-mono" style="font-size:9px;">HOPS: MAX 6 EDGE</div>
        </div>
        <div class="project-card__cover">
          <div>
            <div class="font-mono" style="font-size:9px; color:var(--color-gray);">COMMUNICATIONS</div>
            <div class="font-display" style="font-size:22px; line-height:1.1; margin-top:4px;">MuleNet Protocol</div>
          </div>
          <div>
            <div class="font-script" style="font-size:15px; color:var(--color-black); margin-bottom:8px; opacity:0.8;">Decentralized messaging protocol for off-grid edge devices.</div>
            <div class="project-card__tags">
              <span class="project-card__tag">Go</span>
              <span class="project-card__tag">BLE</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Folder 3: AgentOS -->
      <div class="project-card" onclick="location.href='project-detail.html'">
        <div class="project-card__blueprint">
          <div class="font-mono" style="font-size:10px; opacity:0.8;">DAG // STATE</div>
          <div class="font-display" style="font-size:13px; margin: 4px 0; color:#93C5FD;">LANGGRAPH_ROUTING</div>
          <div class="font-mono" style="font-size:9px; color:#60A5FA;">[PY_WORKFLOW_v2.0]</div>
        </div>
        <div class="project-card__metrics">
          <div class="font-mono" style="font-size:9px; color:var(--color-gray);">EXECUTION TIME</div>
          <div class="font-display" style="font-size:16px; color:var(--accent-orange);">1.2s avg</div>
          <div class="font-mono" style="font-size:9px;">ACCURACY: 98.4%</div>
        </div>
        <div class="project-card__cover">
          <div>
            <div class="font-mono" style="font-size:9px; color:var(--color-gray);">AI AGENT SYSTEMS</div>
            <div class="font-display" style="font-size:22px; line-height:1.1; margin-top:4px;">AgentOS</div>
          </div>
          <div>
            <div class="font-script" style="font-size:15px; color:var(--color-black); margin-bottom:8px; opacity:0.8;">Visual workspace for orchestrating multi-LLM agent swarms.</div>
            <div class="project-card__tags">
              <span class="project-card__tag">Python</span>
              <span class="project-card__tag">Next.js</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Folder 4: VisionPipe -->
      <div class="project-card" onclick="location.href='project-detail.html'">
        <div class="project-card__blueprint">
          <div class="font-mono" style="font-size:10px; opacity:0.8;">CUDA // SHADER</div>
          <div class="font-display" style="font-size:13px; margin: 4px 0; color:#93C5FD;">INFERENCE_PIPELINE</div>
          <div class="font-mono" style="font-size:9px; color:#60A5FA;">[CUDA_STREAM_v3.4]</div>
        </div>
        <div class="project-card__metrics">
          <div class="font-mono" style="font-size:9px; color:var(--color-gray);">FRAME RATE</div>
          <div class="font-display" style="font-size:16px; color:var(--accent-orange);">120 FPS</div>
          <div class="font-mono" style="font-size:9px;">RESOLUTION: 4K CHANNELS</div>
        </div>
        <div class="project-card__cover">
          <div>
            <div class="font-mono" style="font-size:9px; color:var(--color-gray);">COMPUTER VISION</div>
            <div class="font-display" style="font-size:22px; line-height:1.1; margin-top:4px;">VisionPipe</div>
          </div>
          <div>
            <div class="font-script" style="font-size:15px; color:var(--color-black); margin-bottom:8px; opacity:0.8;">Industrial defect detection via high-speed cameras.</div>
            <div class="project-card__tags">
              <span class="project-card__tag">C++</span>
              <span class="project-card__tag">CUDA</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Folder 5: HoloControl -->
      <div class="project-card" onclick="location.href='project-detail.html'">
        <div class="project-card__blueprint">
          <div class="font-mono" style="font-size:10px; opacity:0.8;">CAD // SIM</div>
          <div class="font-display" style="font-size:13px; margin: 4px 0; color:#93C5FD;">ROBOTIC_ARM_KIN</div>
          <div class="font-mono" style="font-size:9px; color:#60A5FA;">[UNITY_SIM_v0.5]</div>
        </div>
        <div class="project-card__metrics">
          <div class="font-mono" style="font-size:9px; color:var(--color-gray);">POSITION ERROR</div>
          <div class="font-display" style="font-size:16px; color:var(--accent-orange);">0.8mm variance</div>
          <div class="font-mono" style="font-size:9px;">UDP JITTER: &lt;5MS</div>
        </div>
        <div class="project-card__cover">
          <div>
            <div class="font-mono" style="font-size:9px; color:var(--color-gray);">SPATIAL COMPUTING</div>
            <div class="font-display" style="font-size:22px; line-height:1.1; margin-top:4px;">HoloControl</div>
          </div>
          <div>
            <div class="font-script" style="font-size:15px; color:var(--color-black); margin-bottom:8px; opacity:0.8;">Spatial computing interface for robotic arms.</div>
            <div class="project-card__tags">
              <span class="project-card__tag">Unity</span>
              <span class="project-card__tag">C#</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Folder 6: BioForecaster -->
      <div class="project-card" onclick="location.href='project-detail.html'">
        <div class="project-card__blueprint">
          <div class="font-mono" style="font-size:10px; opacity:0.8;">CNN // REG</div>
          <div class="font-display" style="font-size:13px; margin: 4px 0; color:#93C5FD;">SATELLITE_IMG_CNN</div>
          <div class="font-mono" style="font-size:9px; color:#60A5FA;">[PYTORCH_YIELD_v1.1]</div>
        </div>
        <div class="project-card__metrics">
          <div class="font-mono" style="font-size:9px; color:var(--color-gray);">YIELD RATIO</div>
          <div class="font-display" style="font-size:16px; color:var(--accent-orange);">94.1% accuracy</div>
          <div class="font-mono" style="font-size:9px;">SPECTRAL BANDS: 8</div>
        </div>
        <div class="project-card__cover">
          <div>
            <div class="font-mono" style="font-size:9px; color:var(--color-gray);">DEEP LEARNING</div>
            <div class="font-display" style="font-size:22px; line-height:1.1; margin-top:4px;">BioForecaster</div>
          </div>
          <div>
            <div class="font-script" style="font-size:15px; color:var(--color-black); margin-bottom:8px; opacity:0.8;">Deep learning crop yield models from satellite imagery.</div>
            <div class="project-card__tags">
              <span class="project-card__tag">PyTorch</span>
              <span class="project-card__tag">Python</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </main>"""

html = re.sub(grid_regex, new_grid, html, flags=re.DOTALL)

with open(work_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("work.html folders update complete.")
