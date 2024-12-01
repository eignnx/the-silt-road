import { useEffect, useRef } from 'react';
import { Weight } from '../model/Commodities';
import "./CargoMeter.css";

type Props = {
    cargo: Weight,
    capacity: Weight,
};

export default function CargoMeter({ cargo, capacity }: Props) {
    const fullPct = 100 * cargo.inLbs() / capacity.inLbs();
    const fillRef = useRef(null);

    const overfilled = fullPct > 100;

    useEffect(() => {
        (fillRef.current as any).style.setProperty("--full-pct", `${fullPct}`);
    }, [cargo, capacity]);

    return <div className="cargo-meter">
        <div
            className="meter-guage"
            ref={fillRef}
        >
            <span className="filling-bar" />
            {overfilled ? <span className="overfilling-bar" /> : null}
        </div>
        <div>{cargo.toString()} / {capacity.toString()}</div>
    </div>;
}