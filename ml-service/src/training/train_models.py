import os
import json
import warnings
warnings.filterwarnings('ignore')

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'synthetic_agri_dataset.csv')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
BEST_MODEL_PATH = os.path.join(MODELS_DIR, 'best_model.joblib')
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, 'preprocessor.joblib')
METRICS_PATH = os.path.join(MODELS_DIR, 'model_metrics.json')

os.makedirs(MODELS_DIR, exist_ok=True)

TARGET_COL = 'yield_tons_per_hectare'
CATEGORICAL_COLS = ['crop', 'season']
NUMERIC_COLS = [
    'year', 'rainfall_mm', 'temperature', 'humidity',
    'nitrogen', 'phosphorus', 'potassium', 'ph',
    'area_hectares', 'irrigation', 'fertilizer_used'
]
FEATURE_COLS = CATEGORICAL_COLS + NUMERIC_COLS

ALLOWED_CROPS = ['Cotton', 'Soybean', 'Wheat', 'Rice', 'Maize', 'Sugarcane', 'Turmeric']
ALLOWED_SEASONS = ['Kharif', 'Rabi', 'Summer']


def load_dataset():
    df = pd.read_csv(DATA_PATH)
    df = df[~df['crop'].astype(str).str.contains('SYNTHETIC', case=False, na=False)].copy()
    df = df.reset_index(drop=True)
    for col in NUMERIC_COLS + [TARGET_COL]:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    df = df.dropna(subset=FEATURE_COLS + [TARGET_COL])
    print(f"Loaded dataset: {len(df)} rows, {len(df.columns)} columns")
    print(f"Crops: {df['crop'].value_counts().to_dict()}")
    return df


def preprocess(df):
    label_encoders = {}
    df_encoded = df.copy()
    for col in CATEGORICAL_COLS:
        le = LabelEncoder()
        df_encoded[col] = le.fit_transform(df_encoded[col].astype(str))
        label_encoders[col] = le

    scaler = StandardScaler()
    scaled_numeric = scaler.fit_transform(df_encoded[NUMERIC_COLS])
    df_scaled = pd.DataFrame(scaled_numeric, columns=NUMERIC_COLS, index=df_encoded.index)

    X = pd.concat([df_encoded[CATEGORICAL_COLS].reset_index(drop=True), df_scaled.reset_index(drop=True)], axis=1)
    y = df_encoded[TARGET_COL].reset_index(drop=True)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
    print(f"Train: {len(X_train)}, Test: {len(X_test)}")

    preprocessor = {
        'label_encoders': label_encoders,
        'scaler': scaler,
        'feature_cols': FEATURE_COLS,
        'categorical_cols': CATEGORICAL_COLS,
        'numeric_cols': NUMERIC_COLS,
        'target_col': TARGET_COL,
    }
    return X_train, X_test, y_train, y_test, preprocessor


def evaluate_model(name, y_true, y_pred):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    print(f"\n{'='*50}")
    print(f"Model: {name}")
    print(f"  MAE  = {mae:.4f}")
    print(f"  RMSE = {rmse:.4f}")
    print(f"  R²   = {r2:.4f}")
    print(f"{'='*50}")
    return {'mae': mae, 'rmse': rmse, 'r2': r2}


def get_models():
    return {
        'LinearRegression': LinearRegression(),
        'RandomForestRegressor': RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1),
        'GradientBoostingRegressor': GradientBoostingRegressor(n_estimators=200, random_state=42),
        'XGBRegressor': XGBRegressor(n_estimators=200, random_state=42, objective='reg:squarederror', n_jobs=-1, verbosity=0),
    }


def get_feature_importance(model, feature_cols):
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
    else:
        importances = np.abs(getattr(model, 'coef_', np.zeros(len(feature_cols))))
    total = importances.sum() if importances.sum() > 0 else 1.0
    norm = (importances / total).tolist()
    return dict(zip(feature_cols, [round(v, 6) for v in norm]))


def tune_best_model(X_train, y_train, best_name):
    print(f"\n=== Tuning hyperparameters for {best_name} ===")
    if best_name == 'RandomForestRegressor':
        model = RandomForestRegressor(random_state=42, n_jobs=-1)
        param_grid = {
            'n_estimators': [200, 300],
            'max_depth': [15, 25, None],
            'min_samples_split': [2, 5],
            'min_samples_leaf': [1, 2],
        }
    elif best_name == 'GradientBoostingRegressor':
        model = GradientBoostingRegressor(random_state=42)
        param_grid = {
            'n_estimators': [200, 300],
            'max_depth': [4, 6],
            'learning_rate': [0.05, 0.1],
            'subsample': [0.8, 1.0],
        }
    elif best_name == 'XGBRegressor':
        model = XGBRegressor(random_state=42, objective='reg:squarederror', n_jobs=-1, verbosity=0)
        param_grid = {
            'n_estimators': [200, 300],
            'max_depth': [4, 6],
            'learning_rate': [0.05, 0.1],
            'subsample': [0.8, 1.0],
            'colsample_bytree': [0.8, 1.0],
        }
    else:
        print(f"No tuning grid for {best_name}, using default.")
        return get_models()[best_name]

    grid = GridSearchCV(
        estimator=model,
        param_grid=param_grid,
        cv=5,
        scoring='r2',
        n_jobs=-1,
        verbose=1,
    )
    grid.fit(X_train, y_train)
    print(f"Best params: {grid.best_params_}")
    print(f"Best CV R²:  {grid.best_score_:.4f}")
    return grid.best_estimator_


def save_outputs(best_model, preprocessor, metrics, feature_importance):
    joblib.dump(best_model, BEST_MODEL_PATH)
    joblib.dump(preprocessor, PREPROCESSOR_PATH)

    output = {
        'best_model': metrics['name'],
        'r2': round(metrics['r2'], 6),
        'rmse': round(metrics['rmse'], 6),
        'mae': round(metrics['mae'], 6),
        'feature_importance': feature_importance,
    }
    with open(METRICS_PATH, 'w') as f:
        json.dump(output, f, indent=2)
    print(f"\nSaved best model -> {BEST_MODEL_PATH}")
    print(f"Saved preprocessor -> {PREPROCESSOR_PATH}")
    print(f"Saved metrics -> {METRICS_PATH}")


def main():
    print("=" * 60)
    print("HarvestPredict - Crop Yield Prediction Model Training")
    print("=" * 60)

    df = load_dataset()
    X_train, X_test, y_train, y_test, preprocessor = preprocess(df)

    models = get_models()
    results = {}
    trained = {}

    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        metrics = evaluate_model(name, y_test, y_pred)
        results[name] = metrics
        trained[name] = model

    sorted_models = sorted(results.items(), key=lambda x: x[1]['r2'], reverse=True)
    best_name, best_metrics = sorted_models[0]
    print(f"\n>>> Best model by R²: {best_name} (R²={best_metrics['r2']:.4f})")

    tuned_model = tune_best_model(X_train, y_train, best_name)
    y_pred_tuned = tuned_model.predict(X_test)
    tuned_metrics = evaluate_model(f"{best_name} (Tuned)", y_test, y_pred_tuned)

    final_model = tuned_model if tuned_metrics['r2'] >= best_metrics['r2'] else trained[best_name]
    final_metrics = tuned_metrics if tuned_metrics['r2'] >= best_metrics['r2'] else best_metrics
    final_metrics['name'] = best_name

    y_pred_final = final_model.predict(X_test)
    if tuned_metrics['r2'] >= best_metrics['r2']:
        final_metrics = evaluate_model(f"{best_name} (Final)", y_test, y_pred_final)
    final_metrics['name'] = best_name

    feature_importance = get_feature_importance(final_model, FEATURE_COLS)
    print("\nFeature Importance:")
    for feat, imp in sorted(feature_importance.items(), key=lambda x: x[1], reverse=True):
        print(f"  {feat:20s}: {imp:.4f}")

    save_outputs(final_model, preprocessor, final_metrics, feature_importance)
    print("\nTraining complete!")


if __name__ == '__main__':
    main()
