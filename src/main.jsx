import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import {
  Car,
  LayoutDashboard,
  Route,
  TriangleAlert,
  Wrench,
  Wallet,
  Search,
  ShieldCheck,
  Plus,
  X
} from "lucide-react";

import "./style.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

const daysLeft = (date) => {
  if (!date) return "-";
  return Math.ceil(
    (new Date(date + "T00:00:00") - new Date()) / 86400000
  );
};

const formatDate = (date) =>
  date
    ? new Date(date + "T00:00:00").toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      })
    : "-";

const emptyForm = {
  vehicle_name: "",
  plate_number: "",
  plate_letters: "",
  serial_number: "",
  model_year: "",
  driver_name: "",
  registration_expiry: "",
  insurance_expiry: ""
};

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadVehicles = async () => {
    setError("");

    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("id");

    if (error) {
      setError(error.message);
    } else {
      setVehicles(data || []);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const addVehicle = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const newVehicle = {
      vehicle_name: form.vehicle_name.trim(),
      plate_number: form.plate_number.trim(),
      plate_letters: form.plate_letters.trim(),
      serial_number: form.serial_number.trim(),
      model_year: form.model_year
        ? Number(form.model_year)
        : null,
      driver_name: form.driver_name.trim() || null,
      registration_expiry: form.registration_expiry,
      insurance_expiry: form.insurance_expiry
    };

    const { error } = await supabase
      .from("vehicles")
      .insert([newVehicle]);

    if (error) {
      setError("تعذر إضافة السيارة: " + error.message);
      setSaving(false);
      return;
    }

    setMessage("تمت إضافة السيارة بنجاح");
    setForm(emptyForm);
    setShowForm(false);
    await loadVehicles();
    setSaving(false);
  };

  const filteredVehicles = vehicles.filter((vehicle) =>
    [
      vehicle.vehicle_name,
      vehicle.plate_number,
      vehicle.plate_letters,
      vehicle.serial_number,
      vehicle.driver_name
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const expiringSoon = vehicles.filter((vehicle) => {
    const registrationDays = daysLeft(
      vehicle.registration_expiry
    );

    const insuranceDays = daysLeft(
      vehicle.insurance_expiry
    );

    return (
      (typeof registrationDays === "number" &&
        registrationDays <= 90) ||
      (typeof insuranceDays === "number" &&
        insuranceDays <= 90)
    );
  }).length;

  return (
    <div className="app">
      <aside>
        <div className="brand">
          <div className="logo">
            <ShieldCheck />
          </div>

          <h1>سائق</h1>
          <small>مركز السادة للرعاية النهارية</small>
        </div>

        <nav>
          <a>
            <LayoutDashboard />
            لوحة التحكم
          </a>

          <a className="active">
            <Car />
            السيارات
          </a>

          <a>
            <Route />
            الحركات
          </a>

          <a>
            <TriangleAlert />
            المخالفات
          </a>

          <a>
            <Wrench />
            الصيانة
          </a>

          <a>
            <Wallet />
            الحسابات
          </a>
        </nav>

        <div className="admin">
          sadaa tanmiah
          <br />
          <small>مدير التطبيق</small>
        </div>
      </aside>

      <main>
        <section className="hero">
          <ShieldCheck />

          <div>
            <h2>متابعة مركبات المركز</h2>
            <p>
              متابعة تلقائية لمواعيد الاستمارة والتأمين
            </p>
          </div>
        </section>

        <section className="stats">
          <div>
            <Car />
            <b>{vehicles.length}</b>
            <span>عدد السيارات</span>
          </div>

          <div>
            <TriangleAlert />
            <b>{expiringSoon}</b>
            <span>خلال 90 يوم</span>
          </div>

          <div>
            <Route />
            <b>0</b>
            <span>سيارات في مشوار</span>
          </div>
        </section>

        <div className="title vehicle-title">
          <h2>السيارات</h2>

          <button
            className="add-vehicle-btn"
            onClick={() => {
              setShowForm(true);
              setMessage("");
              setError("");
            }}
          >
            <Plus size={20} />
            إضافة سيارة
          </button>
        </div>

        {message && (
          <p className="success-message">{message}</p>
        )}

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        {showForm && (
          <div className="vehicle-form-box">
            <div className="form-heading">
              <h3>إضافة سيارة جديدة</h3>

              <button
                type="button"
                className="close-form"
                onClick={() => setShowForm(false)}
              >
                <X />
              </button>
            </div>

            <form
              className="vehicle-form"
              onSubmit={addVehicle}
            >
              <label>
                نوع / اسم السيارة
                <input
                  name="vehicle_name"
                  value={form.vehicle_name}
                  onChange={handleChange}
                  placeholder="مثال: تويوتا ميكرو باص"
                  required
                />
              </label>

              <label>
                رقم اللوحة
                <input
                  name="plate_number"
                  value={form.plate_number}
                  onChange={handleChange}
                  placeholder="1842"
                  required
                />
              </label>

              <label>
                حروف اللوحة
                <input
                  name="plate_letters"
                  value={form.plate_letters}
                  onChange={handleChange}
                  placeholder="ب ط س"
                  required
                />
              </label>

              <label>
                الرقم التسلسلي
                <input
                  name="serial_number"
                  value={form.serial_number}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                سنة الصنع
                <input
                  type="number"
                  name="model_year"
                  value={form.model_year}
                  onChange={handleChange}
                  min="1900"
                  max="2100"
                  required
                />
              </label>

              <label>
                اسم السائق
                <input
                  name="driver_name"
                  value={form.driver_name}
                  onChange={handleChange}
                  placeholder="اختياري"
                />
              </label>

              <label>
                تاريخ انتهاء الاستمارة
                <input
                  type="date"
                  name="registration_expiry"
                  value={form.registration_expiry}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                تاريخ نهاية التأمين
                <input
                  type="date"
                  name="insurance_expiry"
                  value={form.insurance_expiry}
                  onChange={handleChange}
                  required
                />
              </label>

              <div className="form-actions">
                <button
                  type="submit"
                  className="save-vehicle"
                  disabled={saving}
                >
                  {saving
                    ? "جاري الحفظ..."
                    : "حفظ السيارة"}
                </button>

                <button
                  type="button"
                  className="cancel-vehicle"
                  onClick={() => setShowForm(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="search">
          <Search />

          <input
            placeholder="بحث بالنوع أو اللوحة أو السائق"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="grid">
          {filteredVehicles.map((vehicle) => (
            <article className="card" key={vehicle.id}>
              <div className="top">
                <div>
                  <h3>{vehicle.vehicle_name}</h3>

                  <p>
                    موديل {vehicle.model_year}
                    {" · "}
                    تسلسل {vehicle.serial_number}
                  </p>

                  <p>
                    {vehicle.driver_name ||
                      "لا يوجد سائق"}
                  </p>
                </div>

                <div className="plate">
                  <b>{vehicle.plate_number}</b>
                  <span>{vehicle.plate_letters}</span>
                </div>
              </div>

              <div className="date">
                <span>
                  انتهاء الاستمارة
                  <br />
                  <b>
                    {formatDate(
                      vehicle.registration_expiry
                    )}
                  </b>
                </span>

                <em
                  className={
                    daysLeft(
                      vehicle.registration_expiry
                    ) <= 90
                      ? "warn"
                      : ""
                  }
                >
                  باقي{" "}
                  {daysLeft(
                    vehicle.registration_expiry
                  )}{" "}
                  يوم
                </em>
              </div>

              <div className="date">
                <span>
                  نهاية التأمين
                  <br />
                  <b>
                    {formatDate(
                      vehicle.insurance_expiry
                    )}
                  </b>
                </span>

                <em
                  className={
                    daysLeft(
                      vehicle.insurance_expiry
                    ) <= 90
                      ? "warn"
                      : ""
                  }
                >
                  باقي{" "}
                  {daysLeft(
                    vehicle.insurance_expiry
                  )}{" "}
                  يوم
                </em>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(<App />);
