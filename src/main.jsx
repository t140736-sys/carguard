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
  ShieldCheck
} from "lucide-react";

import "./style.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

const daysLeft = (date) =>
  Math.ceil(
    (new Date(date + "T00:00:00") - new Date()) / 86400000
  );

const formatDate = (date) =>
  date
    ? new Date(date + "T00:00:00").toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      })
    : "-";

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("vehicles")
      .select("*")
      .order("id")
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else {
          setVehicles(data || []);
        }
      });
  }, []);

  const filteredVehicles = vehicles.filter((vehicle) =>
    [
      vehicle.vehicle_name,
      vehicle.plate_number,
      vehicle.plate_letters,
      vehicle.serial_number,
      vehicle.driver_name
    ]
      .join(" ")
      .includes(search)
  );

  const expiringSoon = vehicles.filter(
    (vehicle) =>
      Math.min(
        daysLeft(vehicle.registration_expiry),
        daysLeft(vehicle.insurance_expiry)
      ) <= 90
  ).length;

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
            <h2>كل الرخص والتأمينات سارية</h2>
            <p>متابعة تلقائية لمواعيد الاستمارة والتأمين</p>
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

        <div className="title">
          <h2>السيارات</h2>
        </div>

        <div className="search">
          <Search />

          <input
            placeholder="بحث بالنوع أو اللوحة أو السائق"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {error && (
          <p className="error">
            تعذر تحميل البيانات: {error}
          </p>
        )}

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
                    {vehicle.driver_name || "لا يوجد سائق"}
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
                    {formatDate(vehicle.registration_expiry)}
                  </b>
                </span>

                <em
                  className={
                    daysLeft(vehicle.registration_expiry) <= 90
                      ? "warn"
                      : ""
                  }
                >
                  باقي{" "}
                  {daysLeft(vehicle.registration_expiry)}{" "}
                  يوم
                </em>

              </div>

              <div className="date">

                <span>
                  نهاية التأمين
                  <br />
                  <b>
                    {formatDate(vehicle.insurance_expiry)}
                  </b>
                </span>

                <em
                  className={
                    daysLeft(vehicle.insurance_expiry) <= 90
                      ? "warn"
                      : ""
                  }
                >
                  باقي{" "}
                  {daysLeft(vehicle.insurance_expiry)}{" "}
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
