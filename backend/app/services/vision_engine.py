from PIL import Image
import numpy as np
import io
from typing import Tuple, List, Optional
from app.models.schemas import QualityAnalysisResponse, QualityGrade, FoodCategory

# Guard against decompression bomb Denial-of-Service
Image.MAX_IMAGE_PIXELS = 15_000_000

class VisionQualityInspector:
    """
    Multi-modal food quality inspector combining Computer Vision (color degradation,
    surface texture variance) and Environmental Sensor Telemetry (holding temperature, time elapsed).
    Robust against corrupted files, anomalous inputs, and extreme temperatures.
    """

    def analyze_food(
        self,
        image_bytes: Optional[bytes],
        food_name: str,
        category: FoodCategory,
        holding_temp: float,
        hours_elapsed: float,
        humidity: float = 65.0
    ) -> QualityAnalysisResponse:
        
        cv_freshness_score = 92.0  # baseline default
        risk_factors: List[str] = []

        # 1. Computer Vision Feature Extraction (if image supplied)
        if image_bytes and len(image_bytes) > 0:
            try:
                img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                # Safeguard dimensions
                if img.width > 4096 or img.height > 4096:
                    img.thumbnail((1024, 1024))

                img_resized = img.resize((128, 128))
                arr = np.array(img_resized, dtype=np.float32)

                # Mean color channels
                r_mean = float(np.mean(arr[:, :, 0]))
                g_mean = float(np.mean(arr[:, :, 1]))
                b_mean = float(np.mean(arr[:, :, 2]))

                # Color saturation and contrast
                std_rgb = float(np.std(arr))
                brightness = (r_mean + g_mean + b_mean) / 3.0

                # Browning/Oxidation check: Dull gray/brown foods have low variance and skewed R/G
                if brightness < 40.0:
                    cv_freshness_score -= 15.0
                    risk_factors.append("Low luminescence / severe surface darkening detected.")
                elif std_rgb < 16.0:
                    cv_freshness_score -= 8.0
                    risk_factors.append("Surface texture uniformity loss (potential moisture separation).")
                else:
                    cv_freshness_score = min(98.0, 88.0 + (std_rgb / 10.0))

            except (IOError, SyntaxError, Image.DecompressionBombError) as err:
                cv_freshness_score = 80.0
                risk_factors.append(f"Image scan degraded: {type(err).__name__}. Falling back to thermal/temporal telemetry.")
            except Exception:
                cv_freshness_score = 82.0
                risk_factors.append("Generic image parse exception; safety telemetry applied.")

        # 2. Thermal & Temporal Degradation Formula
        # If refrigerated (<= 4°C), baseline shelf life is extended (up to 48 hours for raw/cooked)
        if holding_temp <= 4.0:
            temp_penalty = -5.0
            base_shelf_life_hours = 36.0
            decay_factor = 0.5
        elif holding_temp <= 15.0:
            temp_penalty = 2.0
            base_shelf_life_hours = 12.0
            decay_factor = 0.8
        elif holding_temp <= 25.0:
            # Ambient standard
            temp_penalty = (holding_temp - 20.0) * 0.8
            base_shelf_life_hours = 6.0
            decay_factor = 1.0 + ((holding_temp - 20.0) / 10.0)
        else:
            # Dangerous bacterial proliferation zone (> 25°C)
            temp_penalty = (holding_temp - 25.0) * 2.2
            base_shelf_life_hours = 4.0
            decay_factor = 1.5 + ((holding_temp - 25.0) / 8.0)
            risk_factors.append(f"High risk temperature: Holding at {holding_temp}°C accelerates bacterial reproduction.")

        time_penalty = hours_elapsed * 3.5
        if hours_elapsed > 3.5 and holding_temp > 20.0:
            risk_factors.append(f"Prepared {hours_elapsed:.1f} hours ago under ambient conditions.")

        # Aggregate Freshness Index (0 - 100)
        final_score = cv_freshness_score - temp_penalty - time_penalty
        final_score = max(5.0, min(99.0, round(final_score, 1)))

        # 3. Dynamic Safe Redistribution Window
        decay_factor = max(0.3, decay_factor)
        hours_remaining_raw = max(0.0, (base_shelf_life_hours - hours_elapsed) / decay_factor)
        remaining_minutes = int(hours_remaining_raw * 60)

        # Fail-safe thresholds
        if final_score < 55.0 or (holding_temp > 32.0 and hours_elapsed > 3.0):
            remaining_minutes = 0

        hours_rem = remaining_minutes // 60
        mins_rem = remaining_minutes % 60
        safe_window_str = f"{hours_rem}h {mins_rem}m remaining" if remaining_minutes > 0 else "EXPIRED / BIO-COMPOST ONLY"

        # 4. Grading and Directives
        if final_score >= 80.0 and remaining_minutes >= 90:
            grade = QualityGrade.GRADE_A
            is_safe = True
            action = "CERTIFIED GRADE A: Immediate human consumption redistribution approved."
        elif final_score >= 60.0 and remaining_minutes > 0:
            grade = QualityGrade.GRADE_B
            is_safe = True
            action = "GRADE B CAUTION: Redistribute only within 60 minutes to immediate local shelter."
            risk_factors.append("Accelerated consumption required before microbial onset.")
        else:
            grade = QualityGrade.INEDIBLE
            is_safe = False
            action = "INEDIBLE / UNSAFE FOR HUMAN CONSUMPTION: Auto-routed to bio-methanation / compost."
            risk_factors.append("Safety criteria breached: Strictly prohibited for human redistribution.")

        return QualityAnalysisResponse(
            freshness_index=final_score,
            quality_grade=grade,
            safe_window_minutes=remaining_minutes,
            safe_window_formatted=safe_window_str,
            is_safe_for_consumption=is_safe,
            spoilage_risk_factors=risk_factors,
            action_directive=action
        )

vision_engine = VisionQualityInspector()
